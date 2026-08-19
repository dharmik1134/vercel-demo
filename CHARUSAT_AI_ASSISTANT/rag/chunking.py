import re
from typing import List, Dict, Any, Optional

class DocumentChunker:
    """Handles splitting raw text documents into optimal chunks for embedding."""

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = max(50, chunk_size)
        # Ensure overlap is strictly less than chunk_size
        self.chunk_overlap = min(max(0, chunk_overlap), self.chunk_size - 1)

    def split_text(self, text: str) -> List[str]:
        """Split plain text into overlapping chunks based on character count or paragraphs."""
        if not text or not text.strip():
            return []
            
        paragraphs = text.split("\n\n")
        chunks = []
        current_chunk = ""

        step = max(1, self.chunk_size - self.chunk_overlap)

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            if len(current_chunk) + len(para) + (2 if current_chunk else 0) <= self.chunk_size:
                current_chunk += ("\n\n" if current_chunk else "") + para
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                # Handle large paragraphs that exceed chunk_size individually
                if len(para) > self.chunk_size:
                    for i in range(0, len(para), step):
                        chunk_part = para[i:i + self.chunk_size].strip()
                        if chunk_part:
                            chunks.append(chunk_part)
                    current_chunk = ""
                else:
                    current_chunk = para

        if current_chunk and current_chunk.strip():
            chunks.append(current_chunk.strip())

        return chunks

    def process_document(self, content: str, metadata: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Splits document content and associates metadata with each chunk."""
        meta = metadata.copy() if metadata else {}
        raw_chunks = self.split_text(content)
        
        processed_chunks = []
        for idx, chunk in enumerate(raw_chunks):
            source_id = meta.get('source_id') or meta.get('source') or 'doc'
            # Sanitize source_id for chunk identifier
            clean_id = re.sub(r'[^a-zA-Z0-9_-]', '_', str(source_id))
            processed_chunks.append({
                "chunk_id": f"{clean_id}_chunk_{idx}",
                "content": chunk,
                "metadata": {
                    **meta,
                    "chunk_index": idx,
                    "char_count": len(chunk)
                }
            })
        return processed_chunks

