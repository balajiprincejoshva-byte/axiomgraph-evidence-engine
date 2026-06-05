import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy import text

from main import app, get_session
from models import Claim, Entity
from logic import detect_contradictions, detect_gaps

# Setup in-memory sqlite for testing
sqlite_url = "sqlite://"
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

def get_session_override():
    with Session(engine) as session:
        yield session

app.dependency_overrides[get_session] = get_session_override
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        # Create FTS table and triggers for tests
        session.exec(text("""
            CREATE VIRTUAL TABLE IF NOT EXISTS claim_fts USING fts5(
                id UNINDEXED, text, extracted_quote, claim_type
            );
        """))
        session.exec(text("""
            CREATE TRIGGER IF NOT EXISTS claim_ai AFTER INSERT ON claim BEGIN
                INSERT INTO claim_fts(id, text, extracted_quote, claim_type) 
                VALUES (new.id, new.text, new.extracted_quote, new.claim_type);
            END;
        """))
        session.commit()
    yield
    SQLModel.metadata.drop_all(engine)

def test_detect_contradictions():
    claims = [
        Claim(id=1, subject_entity_id=10, object_entity_id=20, claim_type="inhibits", polarity="positive", text="", relation="", confidence=0.9, evidence_strength="strong", source_chunk_id=1, source_document_id=1, extracted_quote=""),
        Claim(id=2, subject_entity_id=10, object_entity_id=20, claim_type="inhibits", polarity="negative", text="", relation="", confidence=0.8, evidence_strength="strong", source_chunk_id=2, source_document_id=2, extracted_quote="")
    ]
    contradictions = detect_contradictions(claims)
    assert len(contradictions) == 1
    assert contradictions[0]["subject_id"] == 10
    assert contradictions[0]["object_id"] == 20

def test_detect_gaps():
    claims = [
        Claim(id=1, subject_entity_id=10, object_entity_id=20, claim_type="treats", polarity="positive", text="", relation="", confidence=0.4, evidence_strength="weak", methodology="in_vitro", source_chunk_id=1, source_document_id=1, extracted_quote="")
    ]
    gaps = detect_gaps(claims)
    assert len(gaps) == 1
    assert "Fragility Point" in gaps[0]["description"]

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_query_empty():
    response = client.post("/query", json={"query": "   "})
    assert response.status_code == 200
    assert "Please provide a hypothesis" in response.json()["summary"]
