import os
import numpy as np
from typing import List, Tuple
from sentence_transformers import SentenceTransformer
from app.schemas.analysis import DocumentChunk, MatchCandidate
from app.core.config import settings

class SemanticMatchingService:
    def __init__(self):
        # Initialize pretrained SentenceTransformer
        model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'models', 'legal-matcher')
        if os.path.exists(model_path):
            try:
                self.model = SentenceTransformer(model_path)
            except Exception as e:
                print(f"Failed to load fine-tuned model from {model_path}: {e}")
                self.model = SentenceTransformer(settings.PRETRAINED_TRANSFORMER)
        else:
            self.model = SentenceTransformer(settings.PRETRAINED_TRANSFORMER)

    def embed_texts(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.array([])
        return self.model.encode(texts, convert_to_numpy=True)

    def compute_cosine_similarity(self, vec_a: np.ndarray, vec_b: np.ndarray) -> float:
        norm_a = np.linalg.norm(vec_a)
        norm_b = np.linalg.norm(vec_b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(np.dot(vec_a, vec_b) / (norm_a * norm_b))

    def find_candidates(self, requirement_text: str, sop_chunks: List[DocumentChunk], top_k: int = 5) -> List[MatchCandidate]:
        if not sop_chunks:
            return []
        if not requirement_text.strip():
            raise ValueError("A regulatory requirement is required for semantic matching")

        try:
            req_embedding = self.model.encode(requirement_text, convert_to_numpy=True)
            chunk_texts = [c.text for c in sop_chunks]
            chunk_embeddings = self.model.encode(chunk_texts, convert_to_numpy=True)
        except Exception as exc:
            raise RuntimeError(f"Semantic model inference failed: {exc}") from exc

        candidates = []
        for i, chunk in enumerate(sop_chunks):
            sim = self.compute_cosine_similarity(req_embedding, chunk_embeddings[i])
            
            # Simple threshold classification
            if sim >= 0.75:
                label = "MATCH"
            elif sim >= 0.50:
                label = "PARTIAL_MATCH"
            else:
                label = "NO_MATCH"

            candidates.append(MatchCandidate(
                chunk_id=chunk.chunk_id,
                section=chunk.section,
                text=chunk.text,
                similarity_score=round(float(sim), 4),
                classification=label
            ))

        # Sort by similarity score descending
        candidates.sort(key=lambda x: x.similarity_score, reverse=True)
        return candidates[:top_k]
