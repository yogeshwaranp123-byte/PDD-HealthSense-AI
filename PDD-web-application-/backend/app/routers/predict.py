import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.core.security import get_current_user
from app.models.schemas import PredictionResponse
from app.db.database import get_db
from app.core.config import get_settings
from datetime import datetime
import base64
import json
import httpx

logger = logging.getLogger("healthsense.predict")

router = APIRouter(prefix="/predict", tags=["Predictions"])
settings = get_settings()

# HIGH-05: Strict allowlist for disease parameter
ALLOWED_DISEASES = {"diabetes", "kidney", "parkinsons", "lung_cancer", "thyroid"}

# HIGH-03: File upload constraints
MAX_UPLOAD_BYTES = 10 * 1024 * 1024          # 10 MB
ALLOWED_MIME_TYPES = {"application/pdf", "image/jpeg", "image/png", "image/webp"}

# Magic byte signatures for MIME validation (HIGH-03)
MAGIC_SIGNATURES: dict[bytes, str] = {
    b"%PDF": "application/pdf",
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG": "image/png",
    b"RIFF": "image/webp",  # WebP starts with RIFF
}


def _detect_mime(data: bytes) -> str | None:
    """Return MIME type by inspecting magic bytes, or None if unrecognised."""
    for magic, mime in MAGIC_SIGNATURES.items():
        if data[:len(magic)] == magic:
            return mime
    return None


async def _save_and_return(disease: str, inputs: dict, pred: dict, user_id: str) -> dict:
    db = get_db()
    doc = {
        "user_id": user_id,
        "disease": disease,
        "inputs": inputs,
        "result": pred["result"],
        "probability": pred["probability"],
        "confidence": pred["confidence"],
        "shap_top3": pred["shap_top3"],
        "shap_values": pred["shap_top3"],  # for backward compatibility
        "next_steps": pred["next_steps"],
        "created_at": datetime.utcnow(),
    }
    res = await db.predictions.insert_one(doc)
    pred["prediction_id"] = str(res.inserted_id)
    pred["disease"] = disease
    return pred


@router.post("/report", response_model=PredictionResponse)
async def predict_with_report(
    disease: str = Form(...),
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    """Analyze an uploaded medical report (PDF or Image) and predict risk of the selected disease."""

    # HIGH-05: Validate disease against strict allowlist
    disease = disease.strip().lower()
    if disease not in ALLOWED_DISEASES:
        raise HTTPException(
            400,
            f"Invalid disease. Must be one of: {', '.join(sorted(ALLOWED_DISEASES))}"
        )

    if not settings.GEMINI_API_KEY:
        raise HTTPException(503, "AI service is not available at this time.")

    # HIGH-03: Read file and enforce size limit
    try:
        file_bytes = await file.read()
    except Exception:
        raise HTTPException(400, "Failed to read the uploaded file.")

    if len(file_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "File too large. Maximum allowed size is 10 MB.")

    if len(file_bytes) == 0:
        raise HTTPException(400, "Uploaded file is empty.")

    # HIGH-03: Validate MIME type via magic bytes (not client header)
    detected_mime = _detect_mime(file_bytes)
    if detected_mime is None or detected_mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            415,
            "Unsupported file type. Please upload a PDF, JPEG, or PNG image."
        )

    encoded_file = base64.b64encode(file_bytes).decode("utf-8")

    # HIGH-06: Disease is already validated — safe to interpolate
    prompt = f"""You are a clinical diagnostic assistant.
Analyze the provided medical report (PDF or image) to predict the risk of {disease.upper()}.
Provide your findings in a structured JSON object.

CRITICAL REQUIREMENTS:
1. Carefully analyze all relevant lab markers, clinical variables, and health history found in the document.
2. Determine if they suggest a positive or negative indication for the disease: {disease.upper()}.
3. Calculate a risk probability (integer between 0 and 100).
4. Provide a clear clinical explanation of your analysis, noting key values that led to this result.
5. Identify the top 3 most critical contributing factors or markers and assign an estimated percentage impact to each.
6. Provide 4 concrete, actionable next steps for the user based on the results.
7. End your interpretation with a disclaimer: "For educational purposes only. Consult a licensed physician for diagnosis."

JSON Structure:
{{
  "result": "positive" or "negative",
  "probability": number,
  "confidence": "high" or "medium" or "low",
  "interpretation": "Detailed explanation...",
  "shap_top3": {{
    "Marker/Factor 1": number,
    "Marker/Factor 2": number,
    "Marker/Factor 3": number
  }},
  "next_steps": ["Step 1", "Step 2", "Step 3", "Step 4"]
}}

Return ONLY the JSON. Do not wrap in markdown blocks. Do not add any conversational text.
"""

    # HIGH-06: API key in header, NOT in URL
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
    headers = {"x-goog-api-key": settings.GEMINI_API_KEY}

    async with httpx.AsyncClient(timeout=60) as client:
        try:
            response = await client.post(
                url,
                headers=headers,
                json={
                    "contents": [
                        {
                            "parts": [
                                {"text": prompt},
                                {
                                    "inlineData": {
                                        "mimeType": detected_mime,  # use validated MIME, not client header
                                        "data": encoded_file
                                    }
                                }
                            ]
                        }
                    ],
                    "generationConfig": {
                        "responseMimeType": "application/json"
                    }
                }
            )
        except Exception:
            # MED-03: Do not leak exception details to client
            logger.exception("Failed to connect to AI service for report analysis.")
            raise HTTPException(502, "AI service is temporarily unavailable.")

    if response.status_code != 200:
        # MED-03: Log the actual error; return generic message to client
        logger.error(f"AI service returned HTTP {response.status_code} for report analysis.")
        raise HTTPException(502, "AI service returned an error. Please try again later.")

    data = response.json()
    try:
        raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        parsed = json.loads(raw_text)
    except Exception:
        logger.exception("Failed to parse AI report analysis response.")
        raise HTTPException(500, "Could not process the AI response. Please try again.")

    # Save to database history and return
    inputs_saved = {
        "report_filename": file.filename or "unknown",
        "report_size_bytes": len(file_bytes),
        "report_mime_type": detected_mime,
    }

    return await _save_and_return(disease, inputs_saved, parsed, user_id)
