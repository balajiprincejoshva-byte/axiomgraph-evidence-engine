import json
from sqlmodel import Session, select
from database import engine, create_db_and_tables
from models import Document, Chunk, Entity, Claim, GraphEdge

def seed_data():
    create_db_and_tables()
    with Session(engine) as session:
        # Check if already seeded
        if session.exec(select(Document)).first():
            print("Database already seeded.")
            return

        print("Seeding demo data...")

        # 1. Create Documents
        doc1 = Document(
            title="AX-204 demonstrates robust inhibition of EGFR T790M in NSCLC models",
            source_type="research_paper",
            source_name="Journal of Thoracic Oncology",
            publication_date="2023-05-12",
            publication_year=2023,
            authors="Smith et al.",
            abstract="In vitro and in vivo studies show AX-204 potently inhibits EGFR T790M."
        )
        doc2 = Document(
            title="Phase II trial of AX-204 shows clinical benefit in NSCLC",
            source_type="clinical_trial",
            source_name="NCT04561234",
            publication_date="2024-01-20",
            publication_year=2024,
            authors="Investigator Group A",
            abstract="Patients with NSCLC showed a 45% objective response rate when treated with AX-204."
        )
        doc3 = Document(
            title="Post-market Safety Report: AX-204 and Hepatotoxicity",
            source_type="safety_report",
            source_name="FDA FAERS",
            publication_date="2024-06-15",
            publication_year=2024,
            authors="Safety Review Board",
            abstract="Reports indicate elevated liver enzymes (AST/ALT) associated with AX-204 usage in a subset of patients."
        )
        doc4 = Document(
            title="Limited Efficacy of AX-204 in T790M/C797S Double Mutants",
            source_type="research_paper",
            source_name="Cancer Research Weekly",
            publication_date="2024-08-01",
            publication_year=2024,
            authors="Chen et al.",
            abstract="Contrary to earlier reports, AX-204 shows limited efficacy when C797S mutation co-occurs with T790M."
        )
        doc5 = Document(
            title="Composition of matter for BX-900",
            source_type="patent",
            source_name="US Patent Office",
            publication_date="2018-11-05",
            publication_year=2018,
            authors="Axiom Bio",
            abstract="Novel compounds targeting pulmonary fibrosis."
        )

        session.add_all([doc1, doc2, doc3, doc4, doc5])
        session.commit()
        session.refresh(doc1)
        session.refresh(doc2)
        session.refresh(doc3)
        session.refresh(doc4)
        session.refresh(doc5)

        # 2. Create Chunks
        chunk1 = Chunk(document_id=doc1.id, text="AX-204 potently inhibits EGFR T790M with an IC50 of 2nM.", start_offset=0, end_offset=56)
        chunk2 = Chunk(document_id=doc2.id, text="AX-204 treatment resulted in clinical benefit for NSCLC patients.", start_offset=0, end_offset=65)
        chunk3 = Chunk(document_id=doc3.id, text="AX-204 is associated with adverse events including elevated liver enzymes.", start_offset=0, end_offset=74)
        chunk4 = Chunk(document_id=doc4.id, text="Our assay indicates AX-204 fails to inhibit EGFR variants.", start_offset=0, end_offset=58)
        chunk5 = Chunk(document_id=doc5.id, text="BX-900 is designed to target fibrotic pathways in Pulmonary Fibrosis.", start_offset=0, end_offset=69)
        
        session.add_all([chunk1, chunk2, chunk3, chunk4, chunk5])
        session.commit()
        session.refresh(chunk1)
        session.refresh(chunk2)
        session.refresh(chunk3)
        session.refresh(chunk4)
        session.refresh(chunk5)

        # 3. Create Entities
        ent_ax204 = Entity(canonical_name="AX-204", aliases=json.dumps(["Axiomib"]), entity_type="drug")
        ent_egfr = Entity(canonical_name="EGFR", aliases=json.dumps(["ERBB1"]), entity_type="gene")
        ent_nsclc = Entity(canonical_name="Non-small Cell Lung Cancer", aliases=json.dumps(["NSCLC"]), entity_type="disease")
        ent_liver = Entity(canonical_name="Elevated Liver Enzymes", aliases=json.dumps(["Hepatotoxicity", "AST/ALT elevation"]), entity_type="adverse_event")
        ent_bx900 = Entity(canonical_name="BX-900", aliases=json.dumps([]), entity_type="drug")
        ent_pf = Entity(canonical_name="Pulmonary Fibrosis", aliases=json.dumps(["PF"]), entity_type="disease")

        session.add_all([ent_ax204, ent_egfr, ent_nsclc, ent_liver, ent_bx900, ent_pf])
        session.commit()
        for e in [ent_ax204, ent_egfr, ent_nsclc, ent_liver, ent_bx900, ent_pf]:
            session.refresh(e)

        # 4. Create Claims
        claims = [
            Claim(
                text="AX-204 inhibits EGFR",
                claim_type="inhibits",
                subject_entity_id=ent_ax204.id,
                object_entity_id=ent_egfr.id,
                relation="inhibits",
                confidence=0.95,
                evidence_strength="strong",
                polarity="positive",
                methodology="in_vitro",
                source_chunk_id=chunk1.id,
                source_document_id=doc1.id,
                extracted_quote="AX-204 potently inhibits EGFR T790M"
            ),
            Claim(
                text="AX-204 treats NSCLC",
                claim_type="clinical_benefit",
                subject_entity_id=ent_ax204.id,
                object_entity_id=ent_nsclc.id,
                relation="treats",
                confidence=0.88,
                evidence_strength="strong",
                polarity="positive",
                methodology="clinical_trial",
                source_chunk_id=chunk2.id,
                source_document_id=doc2.id,
                extracted_quote="AX-204 treatment resulted in clinical benefit for NSCLC patients."
            ),
            Claim(
                text="AX-204 causes Elevated Liver Enzymes",
                claim_type="adverse_event",
                subject_entity_id=ent_ax204.id,
                object_entity_id=ent_liver.id,
                relation="causes",
                confidence=0.75,
                evidence_strength="moderate",
                polarity="positive",
                methodology="clinical_observation",
                source_chunk_id=chunk3.id,
                source_document_id=doc3.id,
                extracted_quote="associated with adverse events including elevated liver enzymes"
            ),
            # CONTRADICTION
            Claim(
                text="AX-204 fails to inhibit EGFR",
                claim_type="inhibits",
                subject_entity_id=ent_ax204.id,
                object_entity_id=ent_egfr.id,
                relation="does_not_inhibit",
                confidence=0.60,
                evidence_strength="moderate",
                polarity="negative",
                methodology="in_vivo",
                source_chunk_id=chunk4.id,
                source_document_id=doc4.id,
                extracted_quote="AX-204 fails to inhibit EGFR variants"
            ),
            # GAP (No clinical trial evidence for BX-900)
            Claim(
                text="BX-900 targets Pulmonary Fibrosis",
                claim_type="associated_with",
                subject_entity_id=ent_bx900.id,
                object_entity_id=ent_pf.id,
                relation="targets",
                confidence=0.40,
                evidence_strength="weak",
                polarity="positive",
                methodology="computational",
                source_chunk_id=chunk5.id,
                source_document_id=doc5.id,
                extracted_quote="BX-900 is designed to target fibrotic pathways in Pulmonary Fibrosis"
            )
        ]
        
        session.add_all(claims)
        session.commit()
        for c in claims:
            session.refresh(c)

        # 5. Create GraphEdges
        edges = []
        for c in claims:
            edges.append(GraphEdge(
                source_node_id=c.subject_entity_id,
                target_node_id=c.object_entity_id,
                edge_type=c.relation,
                confidence=c.confidence,
                provenance=f"Doc {c.source_document_id}",
                source_claim_id=c.id
            ))
        
        session.add_all(edges)
        session.commit()
        print("Demo data seeded successfully.")

if __name__ == "__main__":
    seed_data()
