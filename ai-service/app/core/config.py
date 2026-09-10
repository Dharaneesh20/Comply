import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Align AI/ML Compliance Intelligence Service"
    API_V1_STR: str = "/api/v1"
    
    # LM Studio configuration
    LM_STUDIO_BASE_URL: str = os.getenv("LM_STUDIO_BASE_URL", "http://127.0.0.1:1234/v1")
    # When empty, use the first model exposed by LM Studio's OpenAI-compatible API.
    LM_STUDIO_MODEL: str = os.getenv("LM_STUDIO_MODEL", "")
    LM_STUDIO_TIMEOUT: float = float(os.getenv("LM_STUDIO_TIMEOUT", "120.0"))
    
    # SearXNG Configuration
    SEARXNG_URL: str = os.getenv("SEARXNG_URL", "http://localhost:8080")
    
    # ML Model Configuration
    MODEL_NAME: str = "align-semantic-matcher"
    MODEL_VERSION: str = "1.0.0"
    PIPELINE_VERSION: str = "1.0.0"
    PRETRAINED_TRANSFORMER: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    class Config:
        case_sensitive = True

settings = Settings()
