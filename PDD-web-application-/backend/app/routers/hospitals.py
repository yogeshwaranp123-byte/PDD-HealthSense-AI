import logging
import re
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from app.core.security import get_current_user
from app.core.config import get_settings
import httpx
import json
import urllib.parse

logger = logging.getLogger("healthsense.hospitals")
router = APIRouter(tags=["Hospitals"])
settings = get_settings()

# MED-06: Allowed characters in the address field
_ADDRESS_PATTERN = re.compile(r"^[a-zA-Z0-9 ,.\-#/]+$")
_ADDRESS_MAX_LEN = 200


def _sanitize_address(address: Optional[str]) -> str:
    """MED-06: Strip and validate the address query parameter."""
    if not address:
        return "Unknown"
    address = address.strip()[:_ADDRESS_MAX_LEN]
    if not _ADDRESS_PATTERN.match(address):
        # Strip any characters outside the safe set
        address = re.sub(r"[^a-zA-Z0-9 ,.\-#/]", "", address)
    return address or "Unknown"


@router.get("/hospitals/nearby")
async def hospitals_nearby(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    address: Optional[str] = Query(None, max_length=_ADDRESS_MAX_LEN),
    user_id: str = Depends(get_current_user),
):
    """Fetch nearby hospitals using Gemini Flash (with OpenStreetMap Overpass fallback)."""

    # MED-06: Sanitize address before embedding in AI prompt
    safe_address = _sanitize_address(address)

    # 1. Try Gemini if configured
    if settings.GEMINI_API_KEY:
        try:
            prompt = f"""You are a highly precise local healthcare directory assistant.
The user needs to find the physically closest hospitals, medical centers, or emergency clinics to their current location.

User's Location details:
- Latitude: {lat}
- Longitude: {lng}
- Readable Address: {safe_address}

Your goal is to identify 5-8 real, physical hospitals, multi-specialty clinics, or 24/7 medical centers that are geographically closest to these coordinates and address.

CRITICAL REQUIREMENTS:
1. STRICT GEOGRAPHIC PROXIMITY: Prioritize closest physical distance.
2. REAL-WORLD DATA: Search for actual, existing, physical facilities.
3. DETAILED SPECS: Provide actual physical street addresses, phone numbers (if known), and official websites (if known).
4. COORDINATES: Provide estimated coordinates (lat, lng) for each facility.

Return a JSON array of objects representing these hospitals.
Each object MUST have the following structure:
{{
  "name": "Exact Name of Hospital/Clinic",
  "address": "Full Street Address, City, State, ZIP",
  "phone": "Phone number or empty string if unknown",
  "website": "Official website URL or empty string if unknown",
  "lat": latitude_float,
  "lng": longitude_float
}}

Return ONLY the JSON array. Do not wrap it in markdown code blocks or include any conversational text."""

            # HIGH-06: API key in header, NOT URL
            url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
            headers = {"x-goog-api-key": settings.GEMINI_API_KEY}

            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    url,
                    headers=headers,
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {"responseMimeType": "application/json"}
                    }
                )
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                hospitals = json.loads(text)
                if isinstance(hospitals, list):
                    for h in hospitals:
                        name = h.get("name", "")
                        addr = h.get("address", "")
                        query_str = f"{name}, {addr}".strip()
                        q = urllib.parse.quote_plus(query_str)
                        h["map_link"] = f"https://www.google.com/maps/search/?api=1&query={q}"
                    return hospitals
        except Exception:
            # MED-03: Log details, return generic error
            logger.exception("Gemini Hospital Search failed — falling back to Overpass API.")

    # 2. Fallback: OpenStreetMap Overpass API
    radius = 5000  # meters
    query = f"""
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:{radius},{lat},{lng});
      way["amenity"="hospital"](around:{radius},{lat},{lng});
    );
    out center 20;
    """
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                "https://overpass-api.de/api/interpreter",
                data={"data": query},
            )
        elements = resp.json().get("elements", [])
        hospitals = []
        for el in elements:
            tags = el.get("tags", {})
            center = el.get("center", el)
            name = tags.get("name", "Unknown Hospital")

            addr_street = tags.get("addr:street", "")
            addr_house = tags.get("addr:housenumber", "")
            addr_city = tags.get("addr:city", "")
            address_str = f"{addr_house} {addr_street}".strip()
            if addr_city:
                address_str = f"{address_str}, {addr_city}" if address_str else addr_city
            if not address_str:
                address_str = f"Near Lat: {center.get('lat')}, Lng: {center.get('lon')}"

            h_lat = center.get("lat")
            h_lng = center.get("lon")
            q = urllib.parse.quote_plus(f"{name} {address_str}")
            map_link = f"https://www.google.com/maps/search/?api=1&query={q}"

            hospitals.append({
                "name": name,
                "address": address_str,
                "lat": h_lat,
                "lng": h_lng,
                "phone": tags.get("phone", tags.get("contact:phone", "")),
                "website": tags.get("website", ""),
                "map_link": map_link
            })
        return hospitals
    except Exception:
        logger.exception("OpenStreetMap Overpass fallback also failed.")
        raise HTTPException(502, "Location service is temporarily unavailable. Please try again.")
