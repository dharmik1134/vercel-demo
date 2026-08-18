import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.config import settings
from database.vector_store import VectorStore, _cosine_similarity
from database.db_client import DBClient
from rag.chunking import DocumentChunker
from rag.embeddings import EmbeddingManager
from rag.pipeline import RAGPipeline

class TestCharusatAIAssistant(unittest.TestCase):

    def test_cosine_similarity(self):
        v1 = [1.0, 0.0, 0.0]
        v2 = [1.0, 0.0, 0.0]
        v3 = [0.0, 1.0, 0.0]
        self.assertAlmostEqual(_cosine_similarity(v1, v2), 1.0, places=4)
        self.assertAlmostEqual(_cosine_similarity(v1, v3), 0.0, places=4)

    def test_chunker(self):
        chunker = DocumentChunker(chunk_size=100, chunk_overlap=20)
        sample = "CHARUSAT is a university in Gujarat. " * 10
        chunks = chunker.split_text(sample)
        self.assertTrue(len(chunks) > 1)
        for chunk in chunks:
            self.assertTrue(len(chunk) <= 120)

    def test_embeddings(self):
        manager = EmbeddingManager()
        emb = manager.get_embedding("Charotar University")
        self.assertEqual(len(emb), 384)
        batch = manager.get_embeddings(["CSPIT", "DEPSTAR", "CMPICA"])
        self.assertEqual(len(batch), 3)

    def test_vector_store(self):
        store = VectorStore(persist_dir="./database/test_chroma", collection_name="test_col")
        self.assertTrue(store.is_connected())
        
        docs = ["CSPIT offers engineering", "CMPICA offers computer applications"]
        metas = [{"cat": "eng"}, {"cat": "ca"}]
        embs = [[1.0] + [0.0] * 383, [0.0, 1.0] + [0.0] * 382]
        ids = ["id_1", "id_2"]
        
        store.add_documents(docs, metas, embs, ids)
        self.assertTrue(store.count() >= 2)
        
        results = store.search([1.0] + [0.0] * 383, top_k=1)
        self.assertEqual(len(results), 1)
        self.assertIn("CSPIT", results[0]["content"])

    def test_db_client(self):
        db = DBClient(db_path="./database/test_app.sqlite3")
        self.assertTrue(db.is_connected())
        success = db.log_interaction("Test question", "Test answer", 0.05)
        self.assertTrue(success)
        logs = db.get_recent_logs(limit=5)
        self.assertTrue(len(logs) >= 1)
        self.assertEqual(logs[0]["query"], "Test question")
        
        # Cleanup test DB file
        if os.path.exists("./database/test_app.sqlite3"):
            os.remove("./database/test_app.sqlite3")

    def test_rag_pipeline(self):
        pipeline = RAGPipeline()
        self.assertTrue(pipeline.vector_store.count() > 0)
        
        res = pipeline.answer_query("What is the NAAC grade of CHARUSAT?")
        self.assertIn("answer", res)
        self.assertTrue(len(res["sources"]) > 0)
        self.assertTrue("NAAC" in res["answer"] or "A+" in res["answer"])

if __name__ == "__main__":
    unittest.main()
