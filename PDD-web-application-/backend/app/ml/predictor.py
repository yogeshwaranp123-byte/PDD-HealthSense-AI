import joblib
import numpy as np
import shap
import os
from typing import Tuple, Dict

PKL_DIR = os.path.join(os.path.dirname(__file__), "..", "pkl")


def _load(name: str):
    path = os.path.join(PKL_DIR, name)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model file not found: {path}. Train models first via Colab notebook.")
    return joblib.load(path)


# Lazy-loaded model cache
_models: Dict[str, object] = {}
_scalers: Dict[str, object] = {}


def get_model(disease: str):
    if disease not in _models:
        _models[disease] = _load(f"{disease}_model.pkl")
    return _models[disease]


def get_scaler(disease: str):
    if disease not in _scalers:
        _scalers[disease] = _load(f"{disease}_scaler.pkl")
    return _scalers[disease]


def _confidence(prob: float) -> str:
    if prob >= 0.80:
        return "high"
    elif prob >= 0.60:
        return "medium"
    return "low"


def _shap_top3(model, scaler, features: np.ndarray, feature_names: list) -> dict:
    try:
        scaled = scaler.transform(features)
        # Tree-based models
        explainer = shap.TreeExplainer(model)
        vals = explainer.shap_values(scaled)
        if isinstance(vals, list):
            vals = vals[1]  # positive class
        vals = np.abs(vals[0])
        total = vals.sum() or 1
        top_idx = np.argsort(vals)[::-1][:3]
        return {feature_names[i]: round(float(vals[i] / total) * 100, 2) for i in top_idx}
    except Exception:
        try:
            # Linear / SVM
            explainer = shap.LinearExplainer(model, scaler.transform(features))
            vals = np.abs(explainer.shap_values(scaler.transform(features))[0])
            total = vals.sum() or 1
            top_idx = np.argsort(vals)[::-1][:3]
            return {feature_names[i]: round(float(vals[i] / total) * 100, 2) for i in top_idx}
        except Exception:
            return {}


# ── Disease-specific predictors ────────────────────────────────────────────────

INTERPRETATIONS = {
    "diabetes": {
        "positive": "Your inputs suggest an elevated risk of Type 2 Diabetes. High glucose and BMI are primary contributors.",
        "negative": "Your inputs indicate a low risk of diabetes based on the current parameters.",
    },
    "kidney": {
        "positive": "Markers such as elevated serum creatinine or reduced hemoglobin suggest chronic kidney disease risk.",
        "negative": "Your kidney function markers appear within acceptable ranges. Risk is low.",
    },
    "parkinsons": {
        "positive": "Vocal biomarker irregularities detected are consistent with early Parkinson's disease indicators.",
        "negative": "Vocal biomarkers appear stable. Low Parkinson's risk based on current measurements.",
    },
    "lung_cancer": {
        "positive": "Symptom pattern and lifestyle factors suggest elevated lung cancer risk. Immediate consultation advised.",
        "negative": "No strong lung cancer indicators detected from the provided symptom data.",
    },
    "thyroid": {
        "positive": "Thyroid hormone levels suggest potential thyroid dysfunction. Further lab evaluation recommended.",
        "negative": "Thyroid parameters appear within normal ranges. Low dysfunction risk.",
    },
}

NEXT_STEPS = {
    "diabetes": {
        "positive": [
            "Schedule a fasting blood glucose and HbA1c test.",
            "Consult an endocrinologist within 2 weeks.",
            "Begin monitoring daily carbohydrate intake.",
            "Aim for 150 min/week of moderate aerobic exercise.",
        ],
        "negative": [
            "Maintain a balanced diet and active lifestyle.",
            "Repeat screening annually if you are above 45 or overweight.",
        ],
    },
    "kidney": {
        "positive": [
            "Get a 24-hour urine albumin test and GFR estimation.",
            "Consult a nephrologist immediately.",
            "Limit protein and sodium intake.",
            "Monitor blood pressure daily.",
        ],
        "negative": [
            "Stay well-hydrated and avoid NSAID overuse.",
            "Annual kidney function panel if you have hypertension or diabetes.",
        ],
    },
    "parkinsons": {
        "positive": [
            "Consult a movement disorder specialist / neurologist.",
            "Consider a DaTscan imaging referral.",
            "Begin voice therapy and physical therapy.",
            "Track symptom changes with a journal.",
        ],
        "negative": [
            "Maintain regular physical activity to support neurological health.",
            "Reassess if tremors or stiffness develop.",
        ],
    },
    "lung_cancer": {
        "positive": [
            "Seek a chest CT scan referral immediately.",
            "Consult a pulmonologist or oncologist.",
            "If you smoke, enroll in a cessation program now.",
            "Avoid second-hand smoke and occupational carcinogens.",
        ],
        "negative": [
            "Avoid smoking and environmental pollutants.",
            "Annual low-dose CT if you are a heavy smoker over 50.",
        ],
    },
    "thyroid": {
        "positive": [
            "Get TSH, Free T3, and Free T4 blood tests.",
            "Consult an endocrinologist.",
            "Discuss medication options (levothyroxine, etc.).",
            "Monitor energy levels, weight, and heart rate.",
        ],
        "negative": [
            "Continue regular thyroid screenings every 2–3 years.",
            "Ensure adequate dietary iodine intake.",
        ],
    },
}


def predict(disease: str, feature_array: np.ndarray, feature_names: list) -> dict:
    model = get_model(disease)
    scaler = get_scaler(disease)
    scaled = scaler.transform(feature_array)
    proba = model.predict_proba(scaled)[0]
    pos_prob = float(proba[1])
    result = "positive" if pos_prob >= 0.5 else "negative"
    shap_top3 = _shap_top3(model, scaler, feature_array, feature_names)
    return {
        "result": result,
        "probability": round(pos_prob * 100, 2),
        "confidence": _confidence(pos_prob),
        "interpretation": INTERPRETATIONS[disease][result],
        "shap_top3": shap_top3,
        "next_steps": NEXT_STEPS[disease][result],
    }
