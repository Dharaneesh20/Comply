from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class DocumentChunk(BaseModel):
    chunk_id: str
    document_id: str
    section: str
    text: str
    start_position: int
    end_position: int

class AnalyzeDocumentRequest(BaseModel):
    document_id: str
    title: str
    text: str
    chunk_size: int = 500

class SourceReference(BaseModel):
    document_id: str
    version: Optional[int] = 1
    chunk_id: Optional[str] = None
    section: Optional[str] = None
    source_text: Optional[str] = None

class EvidenceItem(BaseModel):
    text: str
    source_reference: Optional[SourceReference] = None

class MatchCandidate(BaseModel):
    chunk_id: str
    section: str
    text: str
    similarity_score: float
    classification: str # MATCH, PARTIAL_MATCH, NO_MATCH

class AIAnalysisResult(BaseModel):
    result: str # POTENTIAL_MATCH, PARTIAL_MATCH, POTENTIAL_GAP, POTENTIAL_CONFLICT, REQUIRES_REVIEW
    confidence: float
    evidence: List[EvidenceItem]
    reasoning_summary: str
    suggested_action: str
    model: str
    model_version: str
    pipeline_version: str

class MatchRequest(BaseModel):
    requirement_id: str
    requirement_text: str
    sop_chunks: List[DocumentChunk]

class ConflictRequest(BaseModel):
    requirement_text: str
    sop_a_text: str
    sop_b_text: str

class FindingExplanationRequest(BaseModel):
    finding_title: str
    finding_description: str
    requirement_text: Optional[str] = None
    sop_text: Optional[str] = None

class RemediationSuggestionRequest(BaseModel):
    finding_title: str
    gap_description: str
    sop_text: Optional[str] = None
