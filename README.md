# 🏛️ CHARUSAT AI Assistant

An intelligent, full-stack Retrieval-Augmented Generation (RAG) assistant built for **Charotar University of Science and Technology (CHARUSAT)**.

---

## 🗂️ Complete Directory & File Structure

```text
CHARUSAT_AI_ASSISTAN/
├── .env.example                          # Environment variable template (keys, DB configs)
├── .env                                  # Active environment configuration
├── requirements.txt                      # Python dependencies (FastAPI, ChromaDB, LangChain, etc.)
├── README.md                             # Project documentation & quickstart
│
├── backend/                              # FastAPI Web Server
│   ├── config.py                         # Application configuration & env settings
│   ├── main.py                           # App entry point, CORS & static mounting
│   ├── models.py                         # Pydantic request/response schemas
│   └── routes.py                         # Chat, health, and query endpoints
│
├── frontend/                             # Modern Web User Interface
│   ├── index.html                        # Chat UI with quick topics & suggestions
│   ├── style.css                         # Dark theme, glassmorphism design system
│   └── app.js                            # Frontend API connector & state management
│
├── data/                                 # Datasets & Knowledge Base
│   ├── raw/
│   │   └── charusat_overview.txt         # University prospectus, admissions & college info
│   ├── processed/
│   │   └── sample_chunks.json            # Parsed & semantic chunks
│   └── test/
│       └── eval_questions.json           # Evaluation benchmark questions & ground truth
│
├── rag/                                  # RAG Pipeline & Logic
│   ├── __init__.py
│   ├── chunking.py                       # Document chunking & sliding window
│   ├── embeddings.py                     # Vector embeddings generator
│   └── pipeline.py                       # Context retriever + prompt builder + LLM generator
│
├── database/                             # Database & Vector Store
│   ├── __init__.py
│   ├── vector_store.py                   # ChromaDB vector store wrapper & fallback
│   └── db_client.py                      # SQLite interaction & latency logger
│
├── evaluation/                           # Automated Benchmark Testing
│   ├── __init__.py
│   └── evaluate.py                       # Hit-rate, accuracy & latency evaluator
│
└── docs/                                 # Documentation
    ├── ARCHITECTURE.md                   # System diagram & ingestion flow
    └── API_DOCS.md                       # REST API endpoint definitions
```

---

## 🚀 Quickstart Guide

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Optional: Add your GEMINI_API_KEY or OPENAI_API_KEY in .env for live LLM generation
```

### 3. Start Backend Server
```bash
uvicorn backend.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/v1/health`
- Web UI: `http://localhost:8000/app`

### 4. Open Frontend Interface
Open `frontend/index.html` in your browser or navigate to `http://localhost:8000/app` while the backend is running.

### 5. Run Evaluation Benchmarks
```bash
python3 evaluation/evaluate.py
```

