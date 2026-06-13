import logging
from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.core.config import get_settings
from pydantic import BaseModel, Field
import httpx

logger = logging.getLogger("healthsense.chat")
router = APIRouter(tags=["AI Chat"])
settings = get_settings()

SYSTEM_PROMPT = (
    "You are a clinical health assistant. Your ONLY role is to provide evidence-based "
    "health information, explain medical concepts, and guide users on when to seek professional help. "
    "You must NOT diagnose, prescribe medications, or provide treatment plans. "
    "Always recommend consulting a licensed physician for personal medical decisions. "
    "Refuse any off-topic, non-health-related requests politely but firmly."
)


class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)   # MED-01: input length limit


@router.post("/chat")
async def chat(payload: ChatMessage, user_id: str = Depends(get_current_user)):
    if not settings.GEMINI_API_KEY:
        raise HTTPException(503, "AI chat service is not available at this time.")

    # HIGH-06: API key in header, not URL
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
    headers = {"x-goog-api-key": settings.GEMINI_API_KEY}

    async with httpx.AsyncClient(timeout=120) as client:
        try:
            response = await client.post(
                url,
                headers=headers,
                json={
                    "contents": [
                        {
                            "role": "user",
                            "parts": [{"text": payload.message}]
                        }
                    ],
                    "systemInstruction": {
                        "parts": [{"text": SYSTEM_PROMPT}]
                    },
                    "generationConfig": {
                        "maxOutputTokens": 600,
                        "temperature": 0.3,
                    }
                },
            )
        except Exception:
            # MED-03: Log internally, return generic message
            logger.exception("Failed to reach AI chat service.")
            raise HTTPException(502, "AI chat service is temporarily unavailable.")

    if response.status_code != 200:
        # MED-03: Do not echo AI service response body to client
        logger.error(f"AI chat service returned HTTP {response.status_code}.")
        raise HTTPException(502, "AI chat service returned an error. Please try again.")

    data = response.json()
    try:
        reply = data["candidates"][0]["content"]["parts"][0]["text"]
        return {"reply": reply}
    except (KeyError, IndexError):
        logger.error("Malformed response structure from AI chat service.")
        raise HTTPException(502, "AI service returned an unexpected response. Please try again.")
