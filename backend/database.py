from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import text

sqlite_file_name = "axiomgraph.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, echo=False, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        session.exec(text("""
            CREATE VIRTUAL TABLE IF NOT EXISTS claim_fts USING fts5(
                id UNINDEXED,
                text,
                extracted_quote,
                claim_type
            );
        """))
        session.exec(text("""
            CREATE TRIGGER IF NOT EXISTS claim_ai AFTER INSERT ON claim BEGIN
                INSERT INTO claim_fts(id, text, extracted_quote, claim_type) 
                VALUES (new.id, new.text, new.extracted_quote, new.claim_type);
            END;
        """))
        session.exec(text("""
            CREATE TRIGGER IF NOT EXISTS claim_ad AFTER DELETE ON claim BEGIN
                DELETE FROM claim_fts WHERE id = old.id;
            END;
        """))
        session.exec(text("""
            CREATE TRIGGER IF NOT EXISTS claim_au AFTER UPDATE ON claim BEGIN
                UPDATE claim_fts SET 
                    text = new.text, 
                    extracted_quote = new.extracted_quote, 
                    claim_type = new.claim_type
                WHERE id = old.id;
            END;
        """))
        session.commit()

def get_session():
    with Session(engine) as session:
        yield session
