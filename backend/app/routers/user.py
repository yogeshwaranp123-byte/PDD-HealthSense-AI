from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.models.schemas import ProfileUpdate
from app.db.database import get_db
from bson import ObjectId

router = APIRouter(prefix="/user", tags=["User"])


def _fmt(user: dict) -> dict:
    user["id"] = str(user.pop("_id"))
    user.pop("hashed_password", None)
    return user


def _get_user_query(user_id: str) -> dict:
    if ObjectId.is_valid(user_id):
        return {"_id": ObjectId(user_id)}
    return {"email": user_id}


@router.get("/profile")
async def get_profile(user_id: str = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one(_get_user_query(user_id))
    if not user:
        raise HTTPException(404, "User not found")
    return _fmt(user)


@router.put("/profile")
async def update_profile(payload: ProfileUpdate, user_id: str = Depends(get_current_user)):
    db = get_db()
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    query = _get_user_query(user_id)
    await db.users.update_one(query, {"$set": update_data})
    user = await db.users.find_one(query)
    return _fmt(user)


@router.get("/history")
async def get_history(user_id: str = Depends(get_current_user)):
    db = get_db()
    cursor = db.predictions.find(
        {"user_id": user_id}, sort=[("created_at", -1)]
    )
    results = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        results.append(doc)
    return results
