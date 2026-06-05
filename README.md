# AxiomGraph: Autonomous Biomedical Evidence Engine

AxiomGraph is a portfolio-grade, evidence-first intelligence platform designed for biotech, pharma, and regulatory R&D. It moves beyond generic generative AI chat by structurally grounding answers in a traceable, transparent causal evidence graph.

## The Product Story
In biomedical research and diligence, *truth* is rarely absolute—it is a landscape of overlapping claims, conflicting trial outcomes, and varying degrees of confidence. When evaluating a novel compound or a biomarker target, researchers don't just need an answer; they need to know:
- **Where does this evidence come from?**
- **Are there any contradictions in the literature?**
- **What clinical or mechanistic gaps exist?**

AxiomGraph ingests documents, extracts specific entity claims, builds a causal evidence graph, and exposes this graph through a natural language query interface. Every claim is scored for confidence and linked directly to its source. It automatically surfaces contradictions (e.g., Target X is inhibited by Drug Y vs. Target X is unresponsive) and highlights weak evidence gaps (e.g., missing clinical trials).

## Architecture & Tech Stack

AxiomGraph uses a modern, scalable monorepo structure:

- **Frontend (`/frontend`)**: Next.js 14+ (App Router), React, Tailwind CSS, `shadcn/ui`, Framer Motion, and React Flow for interactive graph visualization.
- **Backend (`/backend`)**: Python 3.11+, FastAPI, SQLModel (Pydantic + SQLAlchemy), SQLite (with FTS5 for semantic search).
- **Core Engine**: A rules-based reasoning layer that maps relationships, flags polarity conflicts, and scores confidence heuristically.

## Setup Instructions

### 1. Backend Setup
The backend uses a local SQLite database for zero-friction setup.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt # (or manually: fastapi uvicorn sqlmodel pytest httpx)

# Seed the database with the synthetic biomedical corpus
python seeder.py

# Run the API server
uvicorn main:app --reload
```
The backend runs at `http://localhost:8000`.

### 2. Frontend Setup
The frontend requires Node.js (v18+).

```bash
cd frontend
npm install
npm run dev
```
The dashboard runs at `http://localhost:3000`.

## Features
- **Semantic Evidence Querying**: Ask natural language questions like *"What evidence supports AX-204 for NSCLC?"*
- **Contradiction Detection**: Automatically flags conflicting evidence (e.g., papers showing efficacy vs. recent papers showing resistance).
- **Gap Detection**: Identifies weakly supported areas (e.g., a compound with mechanistic support but zero clinical data).
- **Evidence Cards**: UI components displaying confidence scores, source types, and the exact extracted quote.
- **Knowledge Graph Explorer**: An interactive React Flow graph showing the immediate causal neighborhood of your query.
- **Report Export**: One-click generation of structured Markdown reports detailing the query summary, citations, and detected gaps.

## Limitations & Future Work
- **Ingestion**: Currently relies on a `seeder.py` for demo data. A full production version would integrate an NLP extraction pipeline (e.g., SciSpacy or an LLM) to parse raw PDFs.
- **Search**: Uses SQLite FTS5 for local deterministic matching. Can be swapped for vector embeddings (e.g., pgvector) for denser semantic search.

## Testing
Run the backend core logic tests:
```bash
cd backend
pytest
```
