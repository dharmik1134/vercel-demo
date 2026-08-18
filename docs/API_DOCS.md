# 📡 API Documentation

Base URL: `http://localhost:8000/api/v1`

---

### 1. Health Check
- **Endpoint**: `GET /api/v1/health`
- **Description**: Verifies backend health and vector database connection.
- **Response**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "vector_db_connected": true
}
```

---

### 2. Chat & Knowledge Query
- **Endpoint**: `POST /api/v1/chat`
- **Description**: Submits a question to the RAG pipeline.
- **Request Body**:
```json
{
  "query": "What are the B.Tech branches available in CSPIT and DEPSTAR?",
  "chat_history": [],
  "top_k": 4
}
```
- **Response**:
```json
{
  "query": "What are the B.Tech branches available in CSPIT and DEPSTAR?",
  "answer": "CSPIT offers Computer Engineering, IT, Civil, Mechanical, EC, and EE, while DEPSTAR specializes in CSE, IT, and AI & ML.",
  "sources": [
    {
      "content": "Institutes include CSPIT (Engineering), DEPSTAR...",
      "metadata": { "source": "charusat_overview.txt" },
      "score": 0.94
    }
  ],
  "latency_seconds": 0.42
}
```
