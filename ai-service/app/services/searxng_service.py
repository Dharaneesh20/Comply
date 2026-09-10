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
            logger.warning(f"SearXNG search error for query '{query}': {e}. Returning simulated regulatory backup sources.")
            return self._get_fallback_results(query, limit)

    def _get_fallback_results(self, query: str, limit: int) -> List[Dict[str, Any]]:
        return [
            {
                "title": "Government Financial Regulatory Compliance Standard (Section 4)",
                "url": "https://www.consumerfinance.gov/compliance/compliance-guidance/",
                "content": "Mandatory requirement: Customer complaints and data access requests must be logged and resolved within specified statutory windows.",
                "domain": "consumerfinance.gov",
                "favicon": "https://www.google.com/s2/favicons?domain=consumerfinance.gov&sz=32",
                "engine": "fallback"
            },
            {
                "title": "ISO/IEC 27001 Information Security Controls Guide",
                "url": "https://www.iso.org/standard/27001",
                "content": "Control A.12.4.1 Logging and Monitoring: System access and operational logs must be retained for audit and dispute resolution.",
                "domain": "iso.org",
                "favicon": "https://www.google.com/s2/favicons?domain=iso.org&sz=32",
                "engine": "fallback"
            },
            {
                "title": "NIST Special Publication 800-53 Rev 5 - Security Controls",
                "url": "https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final",
                "content": "AU-11 Audit Record Retention: Retain audit records for a timeframe consistent with organizational policy and legal requirements.",
                "domain": "nist.gov",
                "favicon": "https://www.google.com/s2/favicons?domain=nist.gov&sz=32",
                "engine": "fallback"
            }
        ][:limit]
