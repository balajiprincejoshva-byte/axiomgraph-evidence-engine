from typing import Optional, List
from sqlmodel import Field, SQLModel
from datetime import datetime
import json

class Document(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    source_type: str # e.g., "paper", "trial", "patent", "safety_report"
    source_name: str
    publication_date: Optional[str] = None
    publication_year: Optional[int] = None
    authors: Optional[str] = None
    abstract: Optional[str] = None
    url: Optional[str] = None
    publication_types: Optional[str] = None
    trust_score: float = Field(default=4.0)
    metadata_json: Optional[str] = None # JSON string for flexibility

class Chunk(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: int = Field(foreign_key="document.id")
    text: str
    start_offset: int
    end_offset: int
    section_name: Optional[str] = None

class Entity(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    canonical_name: str
    aliases: str = Field(default="[]") # JSON list string
    entity_type: str # "gene", "protein", "drug", "disease", "biomarker"
    normalized_id: Optional[str] = None

class Claim(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    text: str
    claim_type: str # "associated_with", "inhibits", "activates", "adverse_event", "clinical_benefit"
    subject_entity_id: int = Field(foreign_key="entity.id")
    object_entity_id: int = Field(foreign_key="entity.id")
    relation: str
    confidence: float # 0.0 to 1.0
    evidence_strength: str # "strong", "moderate", "weak"
    polarity: str # "positive", "negative", "neutral"
    methodology: Optional[str] = None
    intermediate_entity: Optional[str] = None
    source_chunk_id: Optional[int] = Field(default=None, foreign_key="chunk.id")
    source_document_id: int = Field(foreign_key="document.id")
    extracted_quote: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class GraphEdge(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    source_node_id: int = Field(foreign_key="entity.id")
    target_node_id: int = Field(foreign_key="entity.id")
    edge_type: str
    confidence: float
    provenance: str # e.g., "extracted from document X"
    source_claim_id: int = Field(foreign_key="claim.id")
