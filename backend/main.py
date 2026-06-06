from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List, Dict, Any
from pydantic import BaseModel

from database import get_session, create_db_and_tables
from models import Document, Entity, Claim, GraphEdge
from logic import detect_contradictions, detect_gaps, synthesize_hypothesis_test, calculate_stability_score

app = FastAPI(title="AxiomGraph API", description="Autonomous Biomedical Evidence Engine")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/documents", response_model=List[Document])
def get_documents(session: Session = Depends(get_session)):
    docs = session.exec(select(Document)).all()
    return docs

@app.get("/entities", response_model=List[Entity])
def get_entities(session: Session = Depends(get_session)):
    entities = session.exec(select(Entity)).all()
    return entities

@app.get("/claims", response_model=List[Claim])
def get_claims(session: Session = Depends(get_session)):
    claims = session.exec(select(Claim)).all()
    return claims

@app.get("/graph/subgraph")
def get_subgraph(session: Session = Depends(get_session)):
    nodes = session.exec(select(Entity)).all()
    edges = session.exec(select(GraphEdge)).all()
    
    react_flow_nodes = []
    for n in nodes:
        react_flow_nodes.append({
            "id": str(n.id),
            "data": {"label": n.canonical_name, "type": n.entity_type},
            "position": {"x": 250, "y": 250} 
        })
        
    react_flow_edges = []
    for e in edges:
        react_flow_edges.append({
            "id": f"e{e.id}",
            "source": str(e.source_node_id),
            "target": str(e.target_node_id),
            "label": e.edge_type,
            "animated": True if e.confidence < 0.7 else False
        })
        
    return {"nodes": react_flow_nodes, "edges": react_flow_edges}

class QueryRequest(BaseModel):
    query: str

from pubmed import search_pubmed, fetch_abstracts
from nlp_extractor import extract_claims_from_abstract
import re

@app.get("/test_pubmed")
def test_pubmed(q: str):
    try:
        return search_pubmed(q, 5)
    except Exception as e:
        import traceback
        return {"error": str(e), "traceback": traceback.format_exc()}

@app.post("/query")
def process_query(req: QueryRequest, session: Session = Depends(get_session)):
    try:
        """
        Live PubMed Pipeline: Fetches real papers, extracts claims, and runs Judgment logic.
        """
        query = req.query.strip()
        if not query:
            return {"summary": "Please provide a hypothesis.", "supporting_evidence": [], "opposing_evidence": [], "contradictions": [], "gaps": []}
        
        # 1. Query Normalization & Expansion
        clean_query = re.sub(r'[^\w\s-]', '', query)
        
        # Extended stop words and generic verbs that ruin PubMed searches
        stop_words = {"what", "how", "why", "is", "the", "for", "and", "evidence", "supports", "does", "show", "in", "likely", "that", "it", "to", "can", "of", "on", "with"}
        stop_verbs = {"help", "cure", "prevent", "treat", "causes", "leads", "stop", "reduce", "increase", "improve", "suppress", "block", "promote", "stimulate", "suppresses", "driven"}
        
        # Simple synonym mapping for common terms
        synonyms = {
            "turmeric": "curcumin",
            "injury": "wound healing",
            "heart attack": "myocardial infarction",
            "cancer": "neoplasm",
            "covid": "sars-cov-2"
        }
        
        raw_words = clean_query.split()
        words = []
        for w in raw_words:
            wl = w.lower()
            if len(wl) > 2 and wl not in stop_words and wl not in stop_verbs:
                # Apply synonym mapping if it exists
                mapped = synonyms.get(wl, w)
                words.append(mapped)
                
        pubmed_query = " AND ".join(words) if words else clean_query
        
        # 2. Call PubMed API
        pmids = search_pubmed(pubmed_query, max_results=10)
        if not pmids:
            # Fallback if PubMed returns 0 results
            return {
                "summary": f"PubMed returned 0 results for '{pubmed_query}'. Please try a more general hypothesis.",
                "supporting_evidence": [], "opposing_evidence": [], "contradictions": [], "gaps": []
            }
            
        papers = fetch_abstracts(pmids)
        
        # 3. Create Entities
        subj_name = words[0] if words else "Subject"
        obj_name = words[-1] if len(words) > 1 else "Object"
        
        # Simple get-or-create for entities
        subj_ent = session.exec(select(Entity).where(Entity.canonical_name == subj_name)).first()
        if not subj_ent:
            subj_ent = Entity(canonical_name=subj_name, entity_type="Gene/Protein", aliases="[]")
            session.add(subj_ent)
            session.commit()
            session.refresh(subj_ent)
            
        obj_ent = session.exec(select(Entity).where(Entity.canonical_name == obj_name)).first()
        if not obj_ent:
            obj_ent = Entity(canonical_name=obj_name, entity_type="Disease/Phenotype", aliases="[]")
            session.add(obj_ent)
            session.commit()
            session.refresh(obj_ent)

        # 4. Extract Claims and Save Documents
        relevant_claims = []
        
        for paper in papers:
            # Save Doc
            doc = session.exec(select(Document).where(Document.url == paper["url"])).first()
            if not doc:
                doc = Document(
                    title=paper["title"],
                    abstract=paper["abstract"],
                    source_type=paper["source_type"],
                    source_name="PubMed",
                    url=paper["url"],
                    publication_year=paper["publication_year"],
                    authors=paper["authors"],
                    trust_score=paper.get("trust_score", 4.0),
                    publication_types=paper.get("publication_types", "")
                )
                session.add(doc)
                session.commit()
                session.refresh(doc)
                
            # Extract Claims
            extracted = extract_claims_from_abstract(paper["abstract"], words)
            for ext in extracted:
                claim = Claim(
                    subject_entity_id=subj_ent.id,
                    object_entity_id=obj_ent.id,
                    claim_type=ext["claim_type"],
                    polarity=ext["polarity"],
                    text=ext["text"],
                    relation=ext["claim_type"],
                    confidence=ext["confidence"],
                    evidence_strength=ext["evidence_strength"],
                    methodology=ext["methodology"],
                    intermediate_entity=ext.get("intermediate_entity"),
                    source_document_id=doc.id,
                    extracted_quote=ext["extracted_quote"]
                )
                session.add(claim)
                session.commit()
                session.refresh(claim)
                relevant_claims.append(claim)
                
        # If NLP found 0 claims from the abstracts, we can't pressure test it.
        if not relevant_claims:
            return {
                "summary": f"Found {len(papers)} papers on PubMed, but our causal NLP extractor could not identify specific interactions between the query terms.",
                "supporting_evidence": [], "opposing_evidence": [], "contradictions": [], "gaps": []
            }
                
        # 5. Run Judgment Logic
        contradictions = detect_contradictions(relevant_claims)
        gaps = detect_gaps(relevant_claims)
        
        enriched_claims = []
        for c in relevant_claims:
            doc = session.get(Document, c.source_document_id)
            c_dict = c.dict()
            c_dict["document_title"] = doc.title
            c_dict["document_type"] = doc.source_type
            c_dict["publication_year"] = doc.publication_year
            c_dict["url"] = doc.url
            score_data = calculate_stability_score(c, doc.publication_year)
            c_dict["stability_score"] = score_data["score"]
            c_dict["stability_breakdown"] = score_data
            enriched_claims.append(c_dict)
        
        response = synthesize_hypothesis_test(req.query, enriched_claims, contradictions, gaps)
        
        # 6. Graph (Dynamic graph update)
        # Simple graph based on the two entities
        edges = session.exec(select(GraphEdge).where(
            GraphEdge.source_node_id.in_([subj_ent.id, obj_ent.id]) | 
            GraphEdge.target_node_id.in_([subj_ent.id, obj_ent.id])
        )).all()
        
        react_flow_nodes = [
            {"id": str(subj_ent.id), "data": {"label": subj_ent.canonical_name, "type": subj_ent.entity_type}, "position": {"x": 100, "y": 250}},
            {"id": str(obj_ent.id), "data": {"label": obj_ent.canonical_name, "type": obj_ent.entity_type}, "position": {"x": 400, "y": 250}}
        ]
        
        react_flow_edges = []
        added_nodes = {str(subj_ent.id), str(obj_ent.id)}
        
        for c in relevant_claims:
            if c.intermediate_entity:
                inter_id = f"inter_{c.intermediate_entity.replace(' ', '_')}"
                if inter_id not in added_nodes:
                    react_flow_nodes.append({
                        "id": inter_id,
                        "data": {"label": c.intermediate_entity.capitalize(), "type": "Mechanism"},
                        "position": {"x": 250, "y": 250 + (len(added_nodes)*30)}
                    })
                    added_nodes.add(inter_id)
                
                # Edge Subj -> Intermediate
                react_flow_edges.append({
                    "id": f"e_c{c.id}_1",
                    "source": str(c.subject_entity_id),
                    "target": inter_id,
                    "label": "via",
                    "animated": True if c.confidence < 0.7 else False
                })
                # Edge Intermediate -> Obj
                react_flow_edges.append({
                    "id": f"e_c{c.id}_2",
                    "source": inter_id,
                    "target": str(c.object_entity_id),
                    "label": f"{c.claim_type} ({c.polarity})",
                    "animated": True if c.confidence < 0.7 else False
                })
            else:
                react_flow_edges.append({
                    "id": f"e_c{c.id}",
                    "source": str(c.subject_entity_id),
                    "target": str(c.object_entity_id),
                    "label": f"{c.claim_type} ({c.polarity})",
                    "animated": True if c.confidence < 0.7 else False
                })
            
        response["graph"] = {"nodes": react_flow_nodes, "edges": react_flow_edges}
        
        # 7. Add Source Documents
        doc_list = []
        for p in papers:
            # We already saved them, but we want to send them to the frontend
            # We can use the dict directly from papers but add the database ID if needed, 
            # or just send the raw paper dict which is clean.
            doc_list.append(p)
        response["documents"] = doc_list
        
        return response
    except Exception as e:
        import traceback
        return {"summary": f"Server Error: {str(e)} - {traceback.format_exc()}", "supporting_evidence": [], "opposing_evidence": [], "contradictions": [], "gaps": []}

@app.post("/report")
def generate_report(req: QueryRequest, session: Session = Depends(get_session)):
    """
    Generates a Markdown export of the hypothesis pressure test results.
    """
    query_result = process_query(req, session)
    
    md_content = f"# AxiomGraph Hypothesis Pressure Test\n\n"
    md_content += f"**Hypothesis:** {req.query}\n\n"
    md_content += f"## Summary\n{query_result.get('summary', '')}\n\n"
    
    next_exp = query_result.get("next_experiment")
    if next_exp:
        md_content += f"## 🔬 Next Recommended Experiment ({next_exp.get('type', 'assay')})\n> {next_exp.get('description', '')}\n\n"
    
    gaps = query_result.get("gaps", [])
    if gaps:
        md_content += f"## ⚠️ Fragility & Gaps\n"
        for gap in gaps:
            md_content += f"- {gap.get('description')} ({gap.get('suggested_action')})\n"
        md_content += "\n"
        
    contradictions = query_result.get("contradictions", [])
    if contradictions:
        md_content += f"## ❌ Contradiction Radar\n"
        for con in contradictions:
            md_content += f"- **{con.get('conflict_type')}**: {con.get('description')}\n"
        md_content += "\n"
        
    supporting = query_result.get("supporting_evidence", [])
    if supporting:
        md_content += f"## ✅ Strongest Supporting Evidence\n"
        for i, c in enumerate(supporting):
            md_content += f"### Support {i+1}: {c.get('text')}\n"
            md_content += f"- **Stability Score:** {c.get('stability_score', 0):.1f}/100\n"
            md_content += f"- **Source:** {c.get('document_title')} ({c.get('document_type')}, {c.get('publication_year')})\n"
            md_content += f"- **Quote:** \"{c.get('extracted_quote')}\"\n\n"

    opposing = query_result.get("opposing_evidence", [])
    if opposing:
        md_content += f"## 🛑 Strongest Opposing Evidence\n"
        for i, c in enumerate(opposing):
            md_content += f"### Opposition {i+1}: {c.get('text')}\n"
            md_content += f"- **Stability Score:** {c.get('stability_score', 0):.1f}/100\n"
            md_content += f"- **Source:** {c.get('document_title')} ({c.get('document_type')}, {c.get('publication_year')})\n"
            md_content += f"- **Quote:** \"{c.get('extracted_quote')}\"\n\n"
            
    return {"markdown": md_content}
