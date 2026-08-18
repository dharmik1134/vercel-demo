# 🏗️ CHARUSAT AI Assistant - System Architecture

This document describes the design, data pipeline, and system components of the CHARUSAT AI Assistant.

```
[ User UI / Web Interface ]
           │
           ▼ HTTP REST API (FastAPI)
┌────────────────────────────────────────────────────────┐
│                      Backend API                       │
│  - /api/v1/health                                      │
│  - /api/v1/chat                                        │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
               ▼ (Embed & Search)          ▼ (Logs & Stats)
┌──────────────────────────────┐   ┌─────────────────────┐
│      RAG Pipeline Engine     │   │   SQLite Database   │
│  - Text Chunker              │   │  (Interaction Logs) │
│  - Embedding Generator       │   └─────────────────────┘
│  - Prompt Augmentation       │
│  - LLM (Gemini / GPT-4o)     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│     Vector Database Store    │
│  - ChromaDB / FAISS          │
│  - Charusat Knowledge Base   │
└──────────────────────────────┘
```

## Data Ingestion Flow
1. **Raw Files**: University prospectuses, syllabi, and FAQs in `data/raw/`.
2. **Chunking**: Split into semantic paragraphs with configurable chunk size & overlap in `rag/chunking.py`.
3. **Embeddings**: Transformed to vector embeddings with sentence-transformers or LLM embeddings.
4. **Vector Storage**: Indexed in ChromaDB for fast cosine similarity nearest-neighbor lookup.
