from typing import List, Dict, Any
from models import Claim, Entity
import datetime

def calculate_stability_score(claim: Claim, pub_year: int) -> Dict[str, Any]:
    """
    Calculates a multidimensional stability score and generates a transparent breakdown.
    """
    base_score = claim.confidence * 100
    contributors = []
    penalties = []
    
    if claim.confidence >= 0.8:
        contributors.append("Strong statistical/NLP confidence")
    elif claim.confidence < 0.6:
        penalties.append("Weak statistical/NLP confidence")

    # 1. Methodology Multiplier
    methodology_weights = {
        "clinical_trial": 1.2,
        "clinical_observation": 1.1,
        "in_vivo": 1.0,
        "in_vitro": 0.8,
        "computational": 0.7
    }
    weight = methodology_weights.get(claim.methodology, 1.0)
    if weight > 1.0:
        contributors.append(f"High-tier methodology ({claim.methodology.replace('_', ' ')})")
    elif weight < 1.0:
        penalties.append(f"Low-tier methodology ({claim.methodology.replace('_', ' ')})")

    # 2. Time Decay (Knowledge Decay Tracking)
    current_year = datetime.datetime.now().year
    age = max(0, current_year - (pub_year or current_year))
    decay_factor = max(0.6, 1.0 - (age * 0.05)) # Lose 5% per year, max 40% penalty
    
    if age <= 2:
        contributors.append("Recent publication (<2 years)")
    elif age > 5:
        penalties.append(f"Outdated evidence ({age} years old)")

    final_score = base_score * weight * decay_factor
    score = min(100.0, max(0.0, final_score))
    
    return {
        "score": score,
        "contributors": contributors,
        "penalties": penalties
    }

def detect_contradictions(claims: List[Claim]) -> List[Dict[str, Any]]:
    """
    Classifies contradictions as Biological vs Methodological.
    """
    contradictions = []
    
    groups = {}
    for c in claims:
        key = (c.subject_entity_id, c.object_entity_id, c.claim_type)
        if key not in groups:
            groups[key] = []
        groups[key].append(c)
        
    for key, group in groups.items():
        if len(group) > 1:
            polarities = set(c.get("polarity") if isinstance(c, dict) else c.polarity for c in group)
            if "positive" in polarities and "negative" in polarities:
                # Determine contradiction type based on NLP subtypes
                conflict_type = "Biological Variation"
                desc = "Direct biological conflict within the same methodology class. Possible mutant variant interference."
                
                # Check for explicit subtypes from NLP
                negative_claims = [c for c in group if (c.get("polarity") if isinstance(c, dict) else c.polarity) == "negative"]
                subtypes = set(c.get("conflict_subtype") if isinstance(c, dict) else getattr(c, "conflict_subtype", None) for c in negative_claims)
                
                if "replication_failure" in subtypes:
                    conflict_type = "Failed Replication"
                    desc = "A subsequent study failed to reproduce the initial findings."
                elif "dose_dependent" in subtypes:
                    conflict_type = "Dose-Dependent Conflict"
                    desc = "The effect reverses or disappears at different concentrations/doses."
                elif "species_conflict" in subtypes:
                    conflict_type = "Cross-Species Conflict"
                    desc = "The interaction observed in animal models failed to translate to humans (or vice-versa)."
                elif "cohort_conflict" in subtypes:
                    conflict_type = "Cohort Specificity"
                    desc = "The effect is heavily dependent on patient demographics or specific clinical cohorts."
                else:
                    # Fallback to methodology check
                    methodologies = set(c.get("methodology") if isinstance(c, dict) else c.methodology for c in group)
                    if len(methodologies) > 1:
                        conflict_type = "Methodological Divergence"
                        desc = f"Conflict arises between different methodologies: {', '.join(filter(None, methodologies))}."
                
                contradictions.append({
                    "subject_id": key[0],
                    "object_id": key[1],
                    "claim_type": key[2],
                    "conflict_type": conflict_type,
                    "description": desc,
                    "conflicting_claims": [c.id for c in group]
                })
                
    return contradictions

def detect_gaps(claims: List[Claim]) -> List[Dict[str, Any]]:
    gaps = []
    for c in claims:
        if c.evidence_strength == "weak" or c.confidence < 0.6:
            gaps.append({
                "claim_id": c.id,
                "description": f"Fragility Point: This claim relies heavily on {(c.methodology or 'unknown').replace('_', ' ')} models.",
                "suggested_action": "Requires Phase I/II clinical validation to survive pressure test."
            })
    return gaps

def synthesize_hypothesis_test(query: str, claims: List[Dict], contradictions: List[Dict], gaps: List[Dict]) -> Dict[str, Any]:
    """
    Partitions evidence into the Hypothesis Pressure Test format.
    """
    supporting = []
    opposing = []
    
    for c in claims:
        if c["polarity"] == "positive":
            supporting.append(c)
        else:
            opposing.append(c)
            
    # Sort by stability score
    supporting.sort(key=lambda x: x.get("stability_score", 0), reverse=True)
    opposing.sort(key=lambda x: x.get("stability_score", 0), reverse=True)
    
    # 1. Uncertainty Factors
    uncertainty_factors = []
    if len(claims) < 3:
        uncertainty_factors.append("Sparse evidence: Too few robust sources available.")
    if contradictions:
        uncertainty_factors.append("Conflicting findings detected across cohorts or methodologies.")
    
    current_year = datetime.datetime.now().year
    old_papers = [c for c in claims if current_year - c.get("publication_year", current_year) > 5]
    if len(old_papers) > len(claims) / 2 and len(claims) > 0:
         uncertainty_factors.append("Outdated papers dominate the evidence landscape.")

    # 2. Next Experiment Engine
    next_experiment = {"type": "assay", "description": "Conduct targeted in vivo screens."}
    
    if gaps:
        next_experiment = {"type": "validation", "description": gaps[0]["suggested_action"]}
    elif contradictions:
        next_experiment = {"type": "assay", "description": "Resolve methodological conflict with a cross-validation assay."}
    elif supporting and supporting[0].get("methodology") != "clinical_trial":
        next_experiment = {"type": "cohort", "description": "Advance to clinical trial phase."}

    # 3. Fragility Detection
    fragility_warning = None
    falsification_condition = None
    
    if len(supporting) > 0:
        clinical_support = [c for c in supporting if c.get("methodology") == "clinical_trial"]
        if len(clinical_support) == 0:
            fragility_warning = "High Fragility: Current support depends entirely on pre-clinical or observational models with zero clinical validation."
            falsification_condition = f"Hypothesis Collapse Condition: If a double-blind, placebo-controlled human trial fails to replicate the pre-clinical {supporting[0].get('relation', 'interaction')}, current support weakens substantially."
        elif len(supporting) == 1:
            fragility_warning = "High Fragility: Current support depends on a single isolated paper with no replication."
            falsification_condition = "Critical Missing Validation: Independent replication of the initial findings by a secondary research cohort."
            
    if not falsification_condition:
        falsification_condition = "Continuous longitudinal studies are required to ensure the long-term stability of this claim remains intact under large-cohort pressure."

    # 4. Biological Plausibility
    plausibility_score = 50
    plausibility_reasons = []
    
    mechanistic_claims = [c for c in claims if c.get("intermediate_entity")]
    if mechanistic_claims:
        plausibility_score += 30
        plausibility_reasons.append(f"High Plausibility: Explicit mechanistic pathway established via {mechanistic_claims[0].get('intermediate_entity')}.")
        
    if any(c.get("claim_type") == "inhibits" for c in claims):
        plausibility_score += 20
        plausibility_reasons.append("Pharmacological plausibility: Standard inhibition/suppression pathway detected.")
        
    plausibility_score = min(100, plausibility_score)
    plausibility_rating = "High" if plausibility_score >= 80 else "Moderate" if plausibility_score >= 50 else "Low"
    if not plausibility_reasons:
        plausibility_reasons.append("Generic interaction detected with no deep mechanistic pathway established.")

    return {
        "summary": "Hypothesis pressure test complete. See evidence breakdowns below.",
        "supporting_evidence": supporting[:3],
        "opposing_evidence": opposing[:3],
        "contradictions": contradictions,
        "gaps": gaps,
        "uncertainty_factors": uncertainty_factors,
        "next_experiment": next_experiment,
        "fragility_warning": fragility_warning,
        "falsification_condition": falsification_condition,
        "plausibility": {
            "score": plausibility_score,
            "rating": plausibility_rating,
            "reason": plausibility_reasons[0]
        }
    }
