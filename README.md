<div align="center">

# 🧬 AxiomGraph
**Autonomous Biomedical Evidence Intelligence & Causal Graph Engine**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](#)
[![Python FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#)
[![LlamaIndex](https://img.shields.io/badge/LlamaIndex-8A2BE2?style=for-the-badge&logo=llamaindex&logoColor=white)](#)
[![Graph Database](https://img.shields.io/badge/Graph_RAG-035ED1?style=for-the-badge&logo=neo4j&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](#)




> **Standard LLMs hallucinate. AxiomGraph maps the truth.** <br>
> An enterprise-grade decision-support engine that transforms fragmented biomedical literature, clinical trials, and regulatory documents into a deterministic, auditable Causal Knowledge Graph.

</div>

---
<div align="center">
<img width="1280" height="720" alt="Screen Recording 2026-06-06 at 12 01 59 AM(2)" src="https://github.com/user-attachments/assets/4ff2af9c-d83a-4df4-9d1a-e98e46eec726" />

[![To Try KinetiX Demo](https://img.shields.io/badge/Live-Demo-00a393?style=for-the-badge)](https://axiomgraph-evidence-engine-d9yw.vercel.app)

---

## 🚀 The Paradigm Shift in Tech-Bio

Pharmaceutical R&D and clinical strategy are currently bottlenecked by fragmented data. Researchers spend months manually cross-referencing PDFs, FDA safety reports, and trial registries to determine drug efficacy and safety.

**AxiomGraph** automates this. It ingests massive volumes of unstructured biomedical text and orchestrates LLMs to extract relationships, map them to a unified ontology, and construct a **traceable evidence graph**. It answers the hardest questions in R&D: *"What is true, what conflicts, what is missing, and what should be tested next?"*

---

## 🧠 Core Platform Architecture

### 1. Forensic Claim Lineage (Zero Hallucination)
In regulated healthcare industries, an answer without a source is useless. AxiomGraph features a strict traceability architecture. Every generated node, claim, and relationship is forensically linked back to the exact source sentence and PubMed/ClinicalTrials.gov origin document. 

### 2. The Causal Walker (Graph-RAG Engine)
Moving beyond flat keyword search, the platform visually maps complex biological mechanisms. The deterministic Graph-RAG pipeline extracts explicit entity relationships (e.g., `[Osimertinib] → inhibits → [EGFR] → treats → [NSCLC]`), allowing researchers to visually walk the causal pathways of any disease or compound.

### 3. Hypothesis Comparison & A/B Testing
A built-in clinical decision-support interface that allows users to test two hypotheses side-by-side (e.g., *Osimertinib vs. Erlotinib*). The engine calculates a dynamic **Survival Pressure Score**, identifying the strongest supporting evidence and mapping structural contradictions between competing papers.

### 4. Aerogel UX & Telemetry Interface
Designed with a bespoke, laboratory-grade "Aerogel" aesthetic. The interface prioritizes data density and readability, featuring interactive graph nodes, real-time stability metrics, and single-click exportable R&D reports.

---

## 📸 Feature Showcase

*(Note: Add your actual demo GIFs or screenshots here)*

| Forensic Audit Trail | The Causal Knowledge Graph |
| :---: | :---: |
| <img width="400" height="214" alt="ScreenRecording2026-06-06at11 41 54AM-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/adf5cac8-7dbe-477a-952d-55ebf4c586cd" /> | <img width="400" height="214" alt="ScreenRecording2026-06-06at11 44 48AM-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/49472dcc-6a89-4aa7-b344-539053c94bbc" /> |
| *Every claim links directly to the extracted sentence and source document.* | *Interactive node-edge mapping of drug-target-disease pathways.* |

| Hypothesis Comparison Engine | Evidence Drift Timeline |
| :---: | :---: |
| <img width="400" height="214" alt="Screenshot 2026-06-06 at 11 57 38 AM" src="https://github.com/user-attachments/assets/8260ef5d-6d95-4531-a7e0-1da5c9212eb0" /> | <img width="400" height="214" alt="Screenshot 2026-06-06 at 12 01 24 PM" src="https://github.com/user-attachments/assets/08ff89a8-00b7-43b2-b84d-955b49bf0ecd" /> |
| *Side-by-side R&D evaluation with automated next-step recommendations.* | *Chronological mapping of scientific consensus and clinical conflict.* |

---

## 🛠️ Tech Stack & Engineering

AxiomGraph relies on a decoupled, high-performance architecture to handle complex data ingestion and interactive visualization:

* **Frontend Engine:** Next.js 14, React Flow (for interactive graph telemetry), TailwindCSS.
* **Backend Inference:** Python FastAPI, LangChain / LlamaIndex (LLM Orchestration).
* **Data Layer:** Hybrid Vector-Graph retrieval utilizing Graph Database mapping (Neo4j / NetworkX) and dense vector embeddings for semantic search.
* **Ontology Mapping:** NLP entity recognition standardized against biomedical vocabularies.

---

## 💻 Quick Start (Local Deployment)

**1. Clone the Repository**
```bash
git clone [https://github.com/balajiprincejoshva-byte/axiomgraph-evidence-engine.git](https://github.com/balajiprincejoshva-byte/axiomgraph-evidence-engine.git)
cd axiomgraph-evidence-engine
```
## 🔬 Scientific Methodology & Graph Architecture

AxiomGraph operates on a multi-stage **Graph-RAG (Retrieval-Augmented Generation)** architecture, combining dense vector semantics with strict topological graph traversal to eliminate LLM hallucinations.

### Phase 1: Ingestion & Entity Normalization
Raw unstructured data (PubMed PDFs, ClinicalTrials.gov XMLs, FDA Adverse Event Reports) is notoriously noisy. AxiomGraph does not just read text; it standardizes it.
* **Biomedical NER (Named Entity Recognition):** The engine parses documents and isolates key entities (Drugs, Targets, Biomarkers, Phenotypes).
* **Ontology Mapping:** Entities are mapped against standard biomedical vocabularies (UMLS, MeSH, ChEMBL). If one paper says "Osimertinib" and another says "AZD9291", the engine normalizes them into a single, unified node.

### Phase 2: Causal Edge Extraction
Standard vector databases only understand *similarity*. AxiomGraph understands *causality*. 
The LLM orchestration layer extracts directional relationships from the text and writes them to the Graph Database as triad structures: 
`[Node: Source] → [Edge: Relationship] → [Node: Target]`.
* *Example:* `[Osimertinib] → inhibits (positive) → [EGFR]`
* This creates a mathematically traversable network, allowing the system to logically infer that if Drug A inhibits Target B, and Target B causes Disease C, then Drug A treats Disease C.

### Phase 3: The Contradiction & Survival Engine
When evaluating a hypothesis (e.g., "Drug X extends overall survival in Cohort Y"), the engine traverses the graph to pull all supporting *and* opposing claims. 
* **Evidence Drift Mapping:** The system plots claims chronologically. It can autonomously detect if early *in vitro* data (high support) was later contradicted by Phase III clinical trials (high opposition).
* **Survival Pressure Score (0-100):** A proprietary heuristic algorithm that weighs the volume of supporting evidence against the structural fragility of the claims (e.g., heavily penalizing claims that rely solely on outdated mouse models while rewarding recent human trial data).

---

## ⚙️ Systems Topology

AxiomGraph utilizes a decoupled, high-throughput microservice architecture:

* **Inference Layer (Python / FastAPI):** Handles heavy NLP workloads, LLM orchestration (LlamaIndex/LangChain), and builds the NetworkX/Neo4j graph structures in memory.
* **Vector Store & Graph DB:** Maintains the embeddings for semantic search alongside the structural nodes/edges for rigid logical queries.
* **Client Telemetry (Next.js / React Flow):** A browser-native interface that renders the causal graph dynamically using physics-based node clustering, ensuring massive biomedical networks remain readable and interactive.

---
