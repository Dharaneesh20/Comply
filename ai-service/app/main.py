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

from fastapi.responses import StreamingResponse
from app.services.pipeline_stream_service import PipelineStreamService
from pydantic import BaseModel

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

document_service = DocumentAnalysisService()
matching_service = SemanticMatchingService()
llm_provider = LMStudioProvider()
pipeline_stream_service = PipelineStreamService()

class StreamAnalysisRequest(BaseModel):
    document_title: str
    text: str
    requirement_query: str = ""

class OrganizationGuideRequest(BaseModel):
    organization_name: str
    industry: str = ""
    size: str = ""
    locations: str = ""
    culture: str = ""
    process: str = ""
    existing_tools: str = ""
    question: str = ""

@app.post("/api/v1/organization/guide")
async def organization_guide(request: OrganizationGuideRequest):
    prompt = f'''You are an SOP design advisor. Use only the supplied organisation context. Help create practical, auditable SOPs and a healthy operating culture. Do not invent company facts or legal obligations.

Organisation: {request.organization_name}
Industry: {request.industry}
Size: {request.size}
Locations: {request.locations}
Working culture: {request.culture}
Process to document: {request.process}
Tools/systems: {request.existing_tools}
User question: {request.question or 'What information is still needed before drafting this SOP?'}

Return JSON exactly as {{"answer":"clear helpful response", "next_questions":["short question"], "sop_outline":["section title"]}}.'''
    try:
        return await llm_provider.generate_json(prompt)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

@app.get("/api/v1/models/status")
async def get_model_status():
    return await llm_provider.check_model_status()

@app.post("/api/v1/analyze/stream")
async def analyze_stream(request: StreamAnalysisRequest):
    return StreamingResponse(
        pipeline_stream_service.execute_pipeline_stream(
            document_title=request.document_title,
            text=request.text,
            requirement_query=request.requirement_query
        ),
        media_type="text/event-stream"
    )

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
