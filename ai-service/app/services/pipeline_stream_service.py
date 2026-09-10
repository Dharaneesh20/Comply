import datetime
import json
from typing import Any, AsyncGenerator, Dict, List

from app.llm.lm_studio_provider import LMStudioProvider, LMStudioUnavailableError
from app.services.document_analysis_service import DocumentAnalysisService
from app.services.semantic_matching_service import SemanticMatchingService


class PipelineStreamService:
    """Streams evidence-based analysis events. It deliberately has no synthetic results."""

    def __init__(self):
        self.doc_service = DocumentAnalysisService()
        self.match_service = SemanticMatchingService()
        self.llm_provider = LMStudioProvider()

    async def execute_pipeline_stream(self, document_title: str, text: str, requirement_query: str = "") -> AsyncGenerator[str, None]:
        analysis_id = f"analysis-{int(datetime.datetime.now().timestamp())}"

        def event(stage: str, status: str, progress: int, message: str, metadata: Dict[str, Any] | None = None) -> str:
            return "data: " + json.dumps({"analysisId": analysis_id, "timestamp": datetime.datetime.now().isoformat(), "stage": stage, "status": status, "progress": progress, "message": message, "metadata": metadata or {}}) + "\n\n"

        if not text or not text.strip():
            yield event("DOCUMENT_RECEIVED", "FAILED", 0, "Analysis needs SOP text; the document is empty.")
            return
        if not requirement_query.strip():
            requirement_query = "Assess this SOP for procedural clarity, clear ownership, controls, escalation, evidence retention, and internal consistency."

        yield event("DOCUMENT_RECEIVED", "COMPLETED", 10, f"Loaded {len(text)} characters from {document_title}.")
        chunks = self.doc_service.chunk_document(analysis_id, text, max_chunk_chars=700)
        yield event("TEXT_CHUNKING", "COMPLETED", 25, f"Prepared {len(chunks)} SOP sections for evidence matching.", {"chunkCount": len(chunks)})

        model_info = await self.llm_provider.check_model_status()
        if not model_info["is_loaded"]:
            yield event("REGULATORY_VERIFICATION", "FAILED", 30, "No LM Studio model is available. Load a chat-capable model and try again.", {"modelInfo": model_info})
            return
        yield event("REGULATORY_VERIFICATION", "COMPLETED", 35, f"Using local model: {model_info['model']}.", {"modelInfo": model_info})

        try:
            candidates = self.match_service.find_candidates(requirement_query, chunks)
        except Exception as exc:
            yield event("SEMANTIC_MATCHING", "FAILED", 45, f"Semantic matching could not run: {exc}")
            return
        matches = [{"requirementText": requirement_query, "sopSection": candidate.section or candidate.chunk_id, "similarityScore": candidate.similarity_score, "status": candidate.classification, "excerpt": candidate.text[:350]} for candidate in candidates]
        yield event("SEMANTIC_MATCHING", "COMPLETED", 55, f"Ranked {len(matches)} SOP passages against the supplied requirement.", {"matches": matches})

        evidence = "\n\n".join(f"[{m['sopSection']}] {m['excerpt']}" for m in matches) or "No relevant SOP passage was retrieved."
        prompt = f'''Review this SOP for the supplied compliance requirement. Base every conclusion only on the SOP excerpts. Do not claim a law applies and do not invent evidence.

Requirement/question: {requirement_query}

Relevant SOP excerpts:
{evidence}

Return exactly one JSON object with this schema:
{{"summary":"short plain-language assessment","gaps":[{{"title":"short issue","finding":"specific missing, ambiguous, or weak control","evidence":"exact SOP excerpt or empty string","recommendation":"specific SOP change","confidence":0.0}}],"conflicts":[{{"title":"short issue","finding":"two incompatible statements","evidence":"both statements","recommendation":"how to reconcile","confidence":0.0}}],"strengths":["controls that are explicitly present"]}}
Use empty arrays when there are no supported gaps or conflicts.'''
        yield event("GAP_DETECTION", "RUNNING", 65, "Reviewing the actual SOP passages for missing or weak controls.")
        try:
            assessment = await self.llm_provider.generate_json(prompt)
        except LMStudioUnavailableError as exc:
            yield event("GAP_DETECTION", "FAILED", 65, str(exc))
            return

        gaps = self._normalise_findings(assessment.get("gaps"), requirement_query)
        conflicts = self._normalise_findings(assessment.get("conflicts"), "Internal SOP consistency")
        yield event("GAP_DETECTION", "COMPLETED", 82, f"Found {len(gaps)} supported issue(s) to review.", {"gaps": gaps, "summary": assessment.get("summary", "")})
        yield event("CONFLICT_DETECTION", "COMPLETED", 92, f"Found {len(conflicts)} internal consistency issue(s).", {"conflicts": conflicts, "strengths": assessment.get("strengths", [])})
        summary = {"analysisId": analysis_id, "documentTitle": document_title, "matchesFound": len(matches), "gapsFound": len(gaps), "conflictsFound": len(conflicts), "modelUsed": model_info["model"], "assessment": assessment.get("summary", "")}
        yield event("COMPLETED", "COMPLETED", 100, "Analysis complete. Review the evidence and recommended SOP edits.", {"summary": summary})

    @staticmethod
    def _normalise_findings(items: Any, requirement: str) -> List[Dict[str, Any]]:
        if not isinstance(items, list):
            return []
        normalised = []
        for item in items:
            if not isinstance(item, dict):
                continue
            finding, recommendation = str(item.get("finding", "")).strip(), str(item.get("recommendation", "")).strip()
            if not finding or not recommendation:
                continue
            try:
                confidence = max(0.0, min(1.0, float(item.get("confidence", 0.5))))
            except (TypeError, ValueError):
                confidence = 0.5
            normalised.append({"requirement": str(item.get("title") or requirement), "finding": finding, "evidence": str(item.get("evidence", "")), "recommendation": recommendation, "confidence": confidence})
        return normalised
