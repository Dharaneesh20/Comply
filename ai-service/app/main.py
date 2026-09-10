from fastapi import FastAPI, HTTPException
from typing import List, Dict, Any
from app.core.config import settings
from app.schemas.analysis import (
    AnalyzeDocumentRequest, DocumentChunk, MatchRequest, MatchCandidate,
    ConflictRequest, FindingExplanationRequest, RemediationSuggestionRequest, AIAnalysisResult
)
from app.services.document_analysis_service import DocumentAnalysisService
from app.services.semantic_matching_service import SemanticMatchingService
from app.llm.lm_studio_provider import LMStudioProvider

app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

document_service = DocumentAnalysisService()
matching_service = SemanticMatchingService()
llm_provider = LMStudioProvider()

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "UP",
        "service": settings.APP_NAME,
        "modelName": settings.MODEL_NAME,
        "modelVersion": settings.MODEL_VERSION,
        "pipelineVersion": settings.PIPELINE_VERSION
    }

@app.post("/api/v1/analyze/document", response_model=List[DocumentChunk])
def analyze_document(request: AnalyzeDocumentRequest):
    return document_service.chunk_document(request.document_id, request.text, request.chunk_size)

@app.post("/api/v1/analyze/matches", response_model=List[MatchCandidate])
def find_matches(request: MatchRequest):
    return matching_service.find_candidates(request.requirement_text, request.sop_chunks)

@app.post("/api/v1/analyze/conflicts", response_model=AIAnalysisResult)
async def analyze_conflicts(request: ConflictRequest):
    prompt = f"""
    Compare the following two SOP procedure excerpts against the requirement standard:
    Requirement Standard: {request.requirement_text}
    SOP A: {request.sop_a_text}
    SOP B: {request.sop_b_text}

    Identify if there is any potential procedural conflict between SOP A and SOP B.
    Return JSON format with fields: result, confidence, reasoningSummary, suggestedAction.
    """
    data = await llm_provider.generate_json(prompt)
    return AIAnalysisResult(
        result=data.get("result", "POTENTIAL_CONFLICT"),
        confidence=float(data.get("confidence", 0.85)),
        evidence=[
            {"text": request.sop_a_text[:150]},
            {"text": request.sop_b_text[:150]}
        ],
        reasoning_summary=data.get("reasoningSummary", "Discrepancy identified in retention timeframes across SOP operational procedures."),
        suggested_action=data.get("suggestedAction", "Reconcile retention schedules between SOP A and SOP B."),
        model=settings.MODEL_NAME,
        model_version=settings.MODEL_VERSION,
        pipeline_version=settings.PIPELINE_VERSION
    )

@app.post("/api/v1/analyze/finding", response_model=AIAnalysisResult)
async def explain_finding(request: FindingExplanationRequest):
    prompt = f"""
    Analyze compliance finding:
    Title: {request.finding_title}
    Description: {request.finding_description}
    Requirement Standard: {request.requirement_text or 'N/A'}
    SOP Text: {request.sop_text or 'N/A'}

    Explain why this finding occurred and suggest corrective review steps.
    Return JSON format with fields: result, confidence, reasoningSummary, suggestedAction.
    """
    data = await llm_provider.generate_json(prompt)
    return AIAnalysisResult(
        result="POTENTIAL_GAP",
        confidence=float(data.get("confidence", 0.86)),
        evidence=[{"text": request.sop_text[:200] if request.sop_text else "No mapped SOP found"}],
        reasoning_summary=data.get("reasoningSummary", "Finding indicates missing or ambiguous control implementation in current SOP."),
        suggested_action=data.get("suggestedAction", "Review mapped section and update procedure version."),
        model=settings.MODEL_NAME,
        model_version=settings.MODEL_VERSION,
        pipeline_version=settings.PIPELINE_VERSION
    )

@app.post("/api/v1/analyze/remediation", response_model=AIAnalysisResult)
async def suggest_remediation(request: RemediationSuggestionRequest):
    prompt = f"""
    Generate remediation recommendation:
    Finding Title: {request.finding_title}
    Gap Description: {request.gap_description}
    SOP Procedure: {request.sop_text or 'N/A'}

    Provide action step suggestions.
    Return JSON format with fields: result, confidence, reasoningSummary, suggestedAction.
    """
    data = await llm_provider.generate_json(prompt)
    return AIAnalysisResult(
        result="POTENTIAL_GAP",
        confidence=float(data.get("confidence", 0.89)),
        evidence=[{"text": request.gap_description}],
        reasoning_summary=data.get("reasoningSummary", "Current procedure lacks explicit compliance step."),
        suggested_action=data.get("suggestedAction", "Draft updated SOP revision addressing the identified gap."),
        model=settings.MODEL_NAME,
        model_version=settings.MODEL_VERSION,
        pipeline_version=settings.PIPELINE_VERSION
    )
