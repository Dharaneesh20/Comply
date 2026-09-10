import httpx
import json
import logging
from typing import Dict, Any, Optional, List
from app.llm.provider import LLMProvider
from app.core.config import settings

logger = logging.getLogger(__name__)
class LMStudioUnavailableError(RuntimeError):
    """Raised when a real local LM Studio response cannot be obtained."""

class LMStudioProvider(LLMProvider):
    def __init__(self, base_url: Optional[str] = None, model: Optional[str] = None):
        self.base_url = (base_url or settings.LM_STUDIO_BASE_URL).rstrip('/')
        self.model = (model or settings.LM_STUDIO_MODEL).strip() or None
        self.timeout = settings.LM_STUDIO_TIMEOUT

    async def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        endpoint = f"{self.base_url}/chat/completions"
        model = await self._resolve_model()
        sys_message = system_prompt or "You are an expert compliance AI assistant. Always respond ONLY in valid JSON format."
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": sys_message},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            # LM Studio accepts json_schema or text; JSON is enforced by the prompt and parser.
            "response_format": {"type": "text"}
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(endpoint, json=payload)
                response.raise_for_status()
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                if not content:
                    raise ValueError("LM Studio returned an empty completion")
                return self._parse_json(content)
        except Exception as e:
            logger.warning("LM Studio request failed: %s", e)
            raise LMStudioUnavailableError(
                f"Could not obtain a response from LM Studio at {self.base_url}. "
                "Start the local server and load a chat-capable model."
            ) from e

    async def _resolve_model(self) -> str:
        """Use an explicit model when available, otherwise discover LM Studio's loaded model."""
        models = await self._get_models()
        model_ids = [str(model.get("id")) for model in models if model.get("id")]
        if self.model and self.model in model_ids:
            return self.model
        if model_ids:
            self.model = model_ids[0]
            return self.model
        raise LMStudioUnavailableError(
            f"LM Studio at {self.base_url} has no available models. Load a chat-capable model and try again."
        )

    @staticmethod
    def _parse_json(content: str) -> Dict[str, Any]:
        """Accept JSON surrounded by a markdown fence, but never invent a response."""
        cleaned = content.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[-1]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
        value = json.loads(cleaned.strip())
        if not isinstance(value, dict):
            raise ValueError("LM Studio completion was not a JSON object")
        return value

    async def check_model_status(self) -> Dict[str, Any]:
        """Query LM Studio models endpoint to verify model availability."""
        try:
            models = await self._get_models()
            model_ids = [str(model.get("id")) for model in models if model.get("id")]
            if self.model not in model_ids:
                self.model = model_ids[0] if model_ids else self.model
            is_loaded = bool(model_ids)
            return {
                "model": self.model or "No model selected",
                "available": True,
                "is_loaded": is_loaded,
                "status": "READY" if is_loaded else "LOADING"
            }
        except Exception as e:
            logger.debug("LM Studio model check failed: %s", e)

        return {
            "model": self.model or "No model selected",
            "available": False,
            "is_loaded": False,
            "status": "UNAVAILABLE"
        }

    async def _get_models(self) -> List[Dict[str, Any]]:
        """Read the standard OpenAI-compatible endpoint, then LM Studio's native endpoint."""
        endpoints = [
            f"{self.base_url}/models",
            f"{self.base_url.replace('/v1', '')}/api/v1/models",
        ]
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                for endpoint in endpoints:
                    res = await client.get(endpoint)
                    if res.status_code == 200:
                        data = res.json()
                        models = data.get("data", [])
                        if isinstance(models, list) and models:
                            return models
        except httpx.HTTPError as e:
            logger.debug("LM Studio model discovery failed: %s", e)
        return []
