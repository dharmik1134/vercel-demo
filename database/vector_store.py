import os
import math
import importlib
import json
from typing import List, Dict, Any, Optional

def _cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Calculate cosine similarity between two numeric vectors."""
    if not vec1 or not vec2 or len(vec1) != len(vec2):
        return 0.0
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    norm_a = math.sqrt(sum(a * a for a in vec1))
    norm_b = math.sqrt(sum(b * b for b in vec2))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return max(0.0, min(1.0, dot_product / (norm_a * norm_b)))

class VectorStore:
    """Manages vector embeddings storage and similarity search with ChromaDB and in-memory persistence."""

    def __init__(self, persist_dir: str = "./database/chroma_db", collection_name: str = "charusat_kb"):
        self.persist_dir = persist_dir
        self.collection_name = collection_name
        self._client = None
        self._collection = None
        self._in_memory_docs: List[Dict[str, Any]] = []
        self._fallback_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vector_backup.json")
        self._load_fallback_data()

    def _load_fallback_data(self):
        """Load backup vector data if available."""
        if os.path.exists(self._fallback_file):
            try:
                with open(self._fallback_file, "r", encoding="utf-8") as f:
                    self._in_memory_docs = json.load(f)
            except Exception:
                pass

    def _save_fallback_data(self):
        """Save backup vector data to disk."""
        try:
            os.makedirs(self.persist_dir, exist_ok=True)
            with open(self._fallback_file, "w", encoding="utf-8") as f:
                json.dump(self._in_memory_docs, f, ensure_ascii=False)
        except Exception:
            pass

    def _init_chroma(self):
        """Safely initialize ChromaDB persistent client if available, else use in-memory engine."""
        if self._client is not None:
            return

        # Force fast zero-dependency in-memory vector engine on Vercel / Cloud Serverless
        if os.environ.get("VERCEL") or os.environ.get("VERCEL_ENV") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
            self._client = "in-memory"
            self._collection = None
            return

        try:
            chromadb = importlib.import_module("chromadb")
            os.makedirs(self.persist_dir, exist_ok=True)
            self._client = chromadb.PersistentClient(path=self.persist_dir)
            self._collection = self._client.get_or_create_collection(name=self.collection_name)
        except Exception:
            # Clean fallback to fast in-memory cosine vector store
            self._client = "in-memory"
            self._collection = None

    def add_documents(
        self,
        documents: List[str],
        metadatas: List[Dict[str, Any]],
        embeddings: List[List[float]],
        ids: List[str]
    ):
        """Add or update document chunks and their vectors in the vector database."""
        if not documents:
            return

        # In-memory storage with file backup (always synchronized)
        existing_ids = {doc["id"]: idx for idx, doc in enumerate(self._in_memory_docs)}
        for doc, meta, emb, doc_id in zip(documents, metadatas, embeddings, ids):
            entry = {
                "id": doc_id,
                "content": doc,
                "metadata": meta,
                "embedding": emb
            }
            if doc_id in existing_ids:
                self._in_memory_docs[existing_ids[doc_id]] = entry
            else:
                self._in_memory_docs.append(entry)
        
        self._save_fallback_data()

    def search(self, query_embedding: List[float], top_k: int = 4) -> List[Dict[str, Any]]:
        """Query the vector database for nearest neighbors."""
        self._init_chroma()
        
        # ChromaDB branch
        if self._client != "in-memory" and self._collection is not None:
            try:
                count = self._collection.count()
                if count == 0:
                    return self._search_in_memory(query_embedding, top_k)
                    
                n_results = min(top_k, count)
                results = self._collection.query(
                    query_embeddings=[query_embedding],
                    n_results=n_results
                )
                
                formatted = []
                if results and "documents" in results and results["documents"]:
                    docs = results["documents"][0]
                    metas = results["metadatas"][0] if ("metadatas" in results and results["metadatas"]) else [{}] * len(docs)
                    distances = results["distances"][0] if ("distances" in results and results["distances"]) else [0.0] * len(docs)
                    for doc, meta, dist in zip(docs, metas, distances):
                        score = round(max(0.0, 1.0 - (dist if dist is not None else 0.0)), 4)
                        formatted.append({
                            "content": doc,
                            "metadata": meta or {},
                            "score": score
                        })
                return formatted
            except Exception:
                return self._search_in_memory(query_embedding, top_k)
        
        return self._search_in_memory(query_embedding, top_k)

    def _search_in_memory(self, query_embedding: List[float], top_k: int = 4) -> List[Dict[str, Any]]:
        """Accurate in-memory cosine similarity search."""
        if not self._in_memory_docs:
            return []

        scored_docs = []
        for doc in self._in_memory_docs:
            emb = doc.get("embedding", [])
            score = _cosine_similarity(query_embedding, emb)
            scored_docs.append((score, doc))

        scored_docs.sort(key=lambda x: x[0], reverse=True)

        return [
            {
                "content": item[1].get("content", ""),
                "metadata": item[1].get("metadata", {}),
                "score": round(item[0], 4)
            }
            for item in scored_docs[:top_k]
        ]

    def count(self) -> int:
        """Return total number of documents in vector store."""
        self._init_chroma()
        if self._client != "in-memory" and self._collection is not None:
            try:
                return self._collection.count()
            except Exception:
                pass
        return len(self._in_memory_docs)

    def is_connected(self) -> bool:
        """Check if vector store is operational."""
        self._init_chroma()
        return self._collection is not None or self._client == "in-memory"
