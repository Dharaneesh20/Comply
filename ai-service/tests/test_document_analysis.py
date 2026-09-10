import pytest
from app.services.document_analysis_service import DocumentAnalysisService

def test_document_chunking():
    service = DocumentAnalysisService()
    raw_text = """
    SECTION 1: GENERAL CONTROLS
    All customer complaints must be recorded in the complaint register within 24 hours of receipt.
    
    SECTION 2: DATA RETENTION
    Access logs must be retained for at least 90 days.
    """
    chunks = service.chunk_document("sop-1", raw_text, max_chunk_chars=120)
    assert len(chunks) >= 1
    assert chunks[0].document_id == "sop-1"
    full_text = " ".join([c.text.lower() for c in chunks])
    assert "complaints" in full_text
