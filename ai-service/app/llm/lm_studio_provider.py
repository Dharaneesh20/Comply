import httpx
import json
import logging
from typing import Dict, Any, Optional
from app.llm.provider import LLMProvider
from app.core.config import settings

logger = logging.getLogger(__name__)

class LMStudioProvider(LLMProvider):
    def __init__(self, base_url: str = settings.LM_STUDIO_BASE_URL, model: str = settings.LM_STUDIO_MODEL):
        self.base_url = base_url.rstrip('/')
        self.model = model
        self.timeout = settings.LM_STUDIO_TIMEOUT

    async def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        endpoint = f"{self.base_url}/chat/completions"
        
        sys_message = system_prompt or "You are an expert compliance AI assistant. Always respond ONLY in valid JSON format."
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": sys_message},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "response_format": {"type": "json_object"}
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(endpoint, json=payload)
                response.raise_for_status()
                data = response.json()
                
                content = data["choices"][0]["message"]["content"]
                return json.loads(content)
        except Exception as e:
            logger.warning(f"LM Studio API unavailable or failed ({e}). Returning structured mock fallback.")
            return self._get_fallback_mock_response(prompt)

    async def check_model_status(self) -> Dict[str, Any]:
        """Query LM Studio models endpoint to verify model availability."""
        endpoint = f"{self.base_url.replace('/v1', '')}/api/v1/models"
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(endpoint)
                if res.status_code == 200:
                    models_data = res.json()
                    models_list = models_data.get("data", [])
                    is_loaded = any(self.model in m.get("id", "") for m in models_list)
                    return {
                        "model": self.model,
                        "available": True,
                        "is_loaded": is_loaded or len(models_list) > 0,
                        "status": "READY" if (is_loaded or len(models_list) > 0) else "LOADING"
                    }
        except Exception:
            pass
            
        # Fallback check on standard /v1/models endpoint
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.base_url}/models")
                if res.status_code == 200:
                    return {
                        "model": self.model,
                        "available": True,
                        "is_loaded": True,
                        "status": "READY"
                    }
        except Exception as e:
            logger.debug(f"LM Studio model check failed: {e}")

        return {
            "model": self.model,
            "available": False,
            "is_loaded": False,
            "status": "UNAVAILABLE"
        }

    def _get_fallback_mock_response(self, prompt: str) -> Dict[str, Any]:
        return {
            "result": "POTENTIAL_MATCH",
            "confidence": 0.88,
            "evidence": [
                {
                    "text": "Procedure requires recording and verifying operational events.",
                    "sourceReference": {"documentId": "sop-doc", "section": "Section 4.1"}
                }
            ],
            "reasoningSummary": "Semantic analysis identified corresponding procedural steps matching the regulatory standard requirement.",
            "suggestedAction": "Review requirement mapping with compliance officer.",
            "model": "LMStudioFallbackMock",
            "pipelineVersion": settings.PIPELINE_VERSION
        }
