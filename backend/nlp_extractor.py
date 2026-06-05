import re
from typing import List, Dict, Any

# Simple rule-based causal relationship definitions
RELATION_KEYWORDS = {
    "inhibits": ["inhibit", "suppress", "decrease", "reduce", "block", "attenuate", "downregulate", "prevents", "abrogates"],
    "increases": ["increase", "enhance", "promote", "stimulate", "upregulate", "activate", "induce"],
    "treats": ["treat", "improve", "ameliorate", "benefit", "efficacy against", "effective in"],
    "associates_with": ["associate", "correlate", "link", "relate"]
}

def extract_claims_from_abstract(abstract: str, keywords: List[str]) -> List[Dict[str, Any]]:
    """
    Splits an abstract into sentences and uses heuristic NLP rules to extract 
    scientific claims that contain at least one of the user's keywords and a causal verb.
    """
    # Simple sentence tokenizer
    sentences = re.split(r'(?<=[.!?]) +', abstract)
    
    claims = []
    
    for sentence in sentences:
        sentence_lower = sentence.lower()
        
        # Determine methodology from sentence context
        methodology = "in_vitro" # Default
        if any(w in sentence_lower for w in ["patient", "clinical", "cohort", "trial"]):
            methodology = "clinical_trial"
        elif any(w in sentence_lower for w in ["mouse", "mice", "rat", "in vivo", "animal"]):
            methodology = "in_vivo"
        elif any(w in sentence_lower for w in ["cell line", "assay", "in vitro"]):
            methodology = "in_vitro"
            
        # Check if the sentence mentions any of the user's keywords
        has_keyword = False
        if not keywords:
            has_keyword = True
        else:
            for kw in keywords:
                if kw.lower() in sentence_lower:
                    has_keyword = True
                    break
                    
        if not has_keyword:
            continue
            
        # Scan for causal relationships
        for relation_type, verbs in RELATION_KEYWORDS.items():
            for verb in verbs:
                if verb in sentence_lower:
                    # Determine polarity
                    # Simple heuristic: if 'no', 'not', 'fail' appears near the verb, flip polarity
                    polarity = "positive"
                    if any(neg in sentence_lower for neg in ["no effect", "did not", "does not", "failed to", "lack of", "without affecting"]):
                        polarity = "negative"
                        
                    # Extract confidence based on language
                    confidence = 0.8
                    if any(w in sentence_lower for w in ["might", "may", "could", "suggests", "hypothesize"]):
                        confidence = 0.5
                    elif any(w in sentence_lower for w in ["significantly", "strongly", "demonstrated", "proves"]):
                        confidence = 0.95
                        
                    evidence_strength = "strong" if confidence > 0.7 else "weak"
                    
                    # Detect specific contradiction subtypes
                    conflict_subtype = None
                    if polarity == "negative":
                        if any(w in sentence_lower for w in ["replicate", "reproduce", "confirm"]):
                            conflict_subtype = "replication_failure"
                        elif any(w in sentence_lower for w in ["dose", "concentration", "level"]):
                            conflict_subtype = "dose_dependent"
                        elif any(w in sentence_lower for w in ["species", "human vs", "mouse", "rat"]):
                            conflict_subtype = "species_conflict"
                        elif any(w in sentence_lower for w in ["cohort", "population", "demographic", "patients"]):
                            conflict_subtype = "cohort_conflict"
                        else:
                            conflict_subtype = "general_conflict"
                            
                    # Detect intermediate entities for Mechanism Chain
                    intermediate_terms = ["pathway", "receptor", "cells", "kinase", "enzyme", "protein", "axis", "factor", "signaling", "acid", "expression"]
                    found_intermediate = None
                    for term in intermediate_terms:
                        if term in sentence_lower and (not keywords or term not in [k.lower() for k in keywords]):
                            found_intermediate = term
                            break

                    claims.append({
                        "text": f"Found evidence that {keywords[0] if keywords else 'subject'} {verb}s target" + (f" via {found_intermediate}" if found_intermediate else ".") ,
                        "claim_type": relation_type,
                        "polarity": polarity,
                        "confidence": confidence,
                        "evidence_strength": evidence_strength,
                        "methodology": methodology,
                        "conflict_subtype": conflict_subtype,
                        "intermediate_entity": found_intermediate,
                        "extracted_quote": sentence.strip()
                    })
                    break # Stop looking for verbs once we found one in this sentence
            
    return claims
