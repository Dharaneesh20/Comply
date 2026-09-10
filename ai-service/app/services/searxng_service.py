import httpx
import logging
from urllib.parse import urlparse
from typing import List, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

class SearXNGService:
    def __init__(self, base_url: str = settings.SEARXNG_URL):
        self.base_url = base_url.rstrip('/')

    async def search_web(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        endpoint = f"{self.base_url}/search"
        params = {
            "q": query,
            "format": "json"
        }
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(endpoint, params=params)
                response.raise_for_status()
                data = response.json()
                
                results = []
                for item in data.get("results", [])[:limit]:
                    raw_url = item.get("url", "")
                    parsed_domain = ""
                    favicon_url = ""
                    if raw_url:
                        try:
                            parsed_domain = urlparse(raw_url).netloc
                            favicon_url = f"https://www.google.com/s2/favicons?domain={parsed_domain}&sz=32"
                        except Exception:
                            pass
                            
                    results.append({
                        "title": item.get("title", "Regulatory Document"),
                        "url": raw_url,
                        "content": item.get("content", item.get("snippet", "")),
                        "domain": parsed_domain or "Regulatory Source",
                        "favicon": favicon_url,
                        "engine": item.get("engine", "searxng")
                    })
                return results
        except Exception as e:
            logger.warning("SearXNG search error for query '%s': %s", query, e)
            return []
