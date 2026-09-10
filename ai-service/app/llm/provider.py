from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class LLMProvider(ABC):

    @abstractmethod
    async def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        pass
