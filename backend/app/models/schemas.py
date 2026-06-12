from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime
import re


class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        """MED-01: Enforce password complexity."""
        errors = []
        if not re.search(r"[A-Z]", v):
            errors.append("at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            errors.append("at least one lowercase letter")
        if not re.search(r"\d", v):
            errors.append("at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>\-_]", v):
            errors.append("at least one special character (!@#$%^&* etc.)")
        if errors:
            raise ValueError("Password must contain " + ", ".join(errors))
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenRefresh(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class ProfileUpdate(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    blood_type: Optional[str] = None
    existing_conditions: Optional[List[str]] = []
    allergies: Optional[List[str]] = []


# ── Prediction Inputs ──────────────────────────────────────────────────────────

class DiabetesInput(BaseModel):
    pregnancies: float = Field(..., ge=0, le=20)
    glucose: float = Field(..., ge=0, le=300)
    blood_pressure: float = Field(..., ge=0, le=200)
    skin_thickness: float = Field(..., ge=0, le=100)
    insulin: float = Field(..., ge=0, le=900)
    bmi: float = Field(..., ge=0, le=70)
    diabetes_pedigree_function: float = Field(..., ge=0, le=3)
    age: float = Field(..., ge=1, le=120)


class KidneyInput(BaseModel):
    age: float = Field(..., ge=1, le=120)
    bp: float = Field(..., ge=50, le=180)
    sg: float = Field(..., ge=1.0, le=1.03)
    al: float = Field(..., ge=0, le=5)
    su: float = Field(..., ge=0, le=5)
    bgr: float = Field(..., ge=20, le=500)
    bu: float = Field(..., ge=1, le=200)
    sc: float = Field(..., ge=0.1, le=20)
    sod: float = Field(..., ge=100, le=160)
    pot: float = Field(..., ge=2, le=8)
    hemo: float = Field(..., ge=3, le=20)
    pcv: float = Field(..., ge=10, le=55)
    wc: float = Field(..., ge=2000, le=20000)
    rc: float = Field(..., ge=2, le=8)


class ParkinsonsInput(BaseModel):
    fo: float = Field(..., ge=80, le=300, description="MDVP:Fo(Hz)")
    fhi: float = Field(..., ge=80, le=600, description="MDVP:Fhi(Hz)")
    flo: float = Field(..., ge=60, le=250, description="MDVP:Flo(Hz)")
    jitter_percent: float = Field(..., ge=0, le=0.1)
    jitter_abs: float = Field(..., ge=0, le=0.001)
    rap: float = Field(..., ge=0, le=0.1)
    ppq: float = Field(..., ge=0, le=0.1)
    ddp: float = Field(..., ge=0, le=0.1)
    shimmer: float = Field(..., ge=0, le=0.2)
    shimmer_db: float = Field(..., ge=0, le=2)
    apq3: float = Field(..., ge=0, le=0.1)
    apq5: float = Field(..., ge=0, le=0.15)
    apq: float = Field(..., ge=0, le=0.15)
    dda: float = Field(..., ge=0, le=0.2)
    nhr: float = Field(..., ge=0, le=0.5)
    hnr: float = Field(..., ge=5, le=40)
    rpde: float = Field(..., ge=0, le=1)
    dfa: float = Field(..., ge=0.5, le=1)
    spread1: float = Field(..., ge=-10, le=0)
    spread2: float = Field(..., ge=0, le=0.5)
    d2: float = Field(..., ge=1, le=4)
    ppe: float = Field(..., ge=0, le=0.6)


class LungCancerInput(BaseModel):
    gender: int = Field(..., ge=0, le=1, description="0=Female 1=Male")
    age: int = Field(..., ge=1, le=120)
    smoking: int = Field(..., ge=1, le=2)
    yellow_fingers: int = Field(..., ge=1, le=2)
    anxiety: int = Field(..., ge=1, le=2)
    peer_pressure: int = Field(..., ge=1, le=2)
    chronic_disease: int = Field(..., ge=1, le=2)
    fatigue: int = Field(..., ge=1, le=2)
    allergy: int = Field(..., ge=1, le=2)
    wheezing: int = Field(..., ge=1, le=2)
    alcohol_consuming: int = Field(..., ge=1, le=2)
    coughing: int = Field(..., ge=1, le=2)
    shortness_of_breath: int = Field(..., ge=1, le=2)
    swallowing_difficulty: int = Field(..., ge=1, le=2)
    chest_pain: int = Field(..., ge=1, le=2)


class ThyroidInput(BaseModel):
    age: float = Field(..., ge=1, le=120)
    sex: int = Field(..., ge=0, le=1, description="0=Female 1=Male")
    on_thyroxine: int = Field(..., ge=0, le=1)
    query_on_thyroxine: int = Field(..., ge=0, le=1)
    on_antithyroid_meds: int = Field(..., ge=0, le=1)
    sick: int = Field(..., ge=0, le=1)
    pregnant: int = Field(..., ge=0, le=1)
    tsh: float = Field(..., ge=0, le=100)
    t3: float = Field(..., ge=0, le=10)
    tt4: float = Field(..., ge=0, le=300)
    t4u: float = Field(..., ge=0, le=3)
    fti: float = Field(..., ge=0, le=300)


class PredictionResponse(BaseModel):
    disease: str
    result: str
    probability: float
    confidence: str
    interpretation: str
    shap_top3: dict
    next_steps: List[str]
    prediction_id: Optional[str] = None
