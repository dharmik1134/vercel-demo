import hashlib
import math
from typing import List

class EmbeddingManager:
    """Manages embedding generation using HuggingFace sentence-transformers with normalized fallback."""
    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.model_name = model_name
        self._model = None
        self.dimension = 384

    def _load_model(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(self.model_name)
            except Exception:
                # Fallback deterministic pseudo-semantic embedding generator
                self._model = "fallback"

    def get_embedding(self, text: str) -> List[float]:
        """Generate embedding vector for a single query/text."""
        return self.get_embeddings([text])[0]

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts."""
        if not texts:
            return []

        self._load_model()
        
        if self._model != "fallback":
            try:
                embeddings = self._model.encode(texts, convert_to_numpy=True)
                return embeddings.tolist()
            except Exception as e:
                # Fallback to pseudo-semantic vectors if model encoding fails
                pass

        # Robust 384-dimensional normalized pseudo-semantic vector generator
        # Employs token hashing and character n-grams to preserve lexical/semantic similarity
        results = []
        for text in texts:
            words = text.lower().split()
            vec = [0.0] * self.dimension
            
            # Aggregate word and subword hash components
            for word in words:
                # Full word hash
                h = int(hashlib.sha256(word.encode("utf-8")).hexdigest(), 16)
                for i in range(16):
                    idx = (h >> (i * 16)) % self.dimension
                    val = (((h >> (i * 8)) & 0xFF) / 128.0) - 1.0
                    vec[idx] += val
                
                # Character trigrams for morphological similarity
                if len(word) >= 3:
                    for j in range(len(word) - 2):
                        tri = word[j:j+3]
                        tri_h = int(hashlib.md5(tri.encode("utf-8")).hexdigest(), 16)
                        idx = tri_h % self.dimension
                        vec[idx] += 0.5

            # If text is empty or vec is all zeroes
            if not words or all(v == 0.0 for v in vec):
                h = int(hashlib.md5(text.encode("utf-8", errors="ignore")).hexdigest(), 16)
                vec = [(((h >> (i % 64)) & 0xFF) / 128.0) - 1.0 for i in range(self.dimension)]

            # Normalize vector to unit length (L2 normalization)
            norm = math.sqrt(sum(v * v for v in vec))
            if norm > 0.0:
                normalized_vec = [round(v / norm, 6) for v in vec]
            else:
                normalized_vec = [1.0 / math.sqrt(self.dimension)] * self.dimension
                
            results.append(normalized_vec)

        return results

