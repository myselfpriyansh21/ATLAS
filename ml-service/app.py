"""
ATLAS ML Microservice

Three real, trained scikit-learn models served over HTTP:
  POST /predict-rul       — Remaining Useful Life regression
  POST /classify-risk     — normal / warning / critical classification
  POST /detect-anomaly    — Isolation Forest anomaly detection
  POST /predict-all       — convenience endpoint calling all three at once
  GET  /health            — readiness check

Input to every endpoint is the same 4-number feature vector:
  [temp_ratio, pressure_ratio, vibration_ratio, gas_ratio]
where each ratio = current sensor value / that metric's "safe max"
threshold (0 if the asset has no sensor for that channel). The frontend
computes these ratios from the simulation engine's asset + threshold data
— see src/lib/ml/features.ts.

Run: uvicorn app:app --reload --port 8000
"""

from pathlib import Path
from typing import Literal

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

MODELS_DIR = Path(__file__).parent / "models"

app = FastAPI(title="ATLAS ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load models once at startup ─────────────────────────────────
try:
    rul_model = joblib.load(MODELS_DIR / "rul_regressor.joblib")
    risk_model = joblib.load(MODELS_DIR / "risk_classifier.joblib")
    anomaly_model = joblib.load(MODELS_DIR / "anomaly_detector.joblib")
    anomaly_threshold = joblib.load(MODELS_DIR / "anomaly_threshold.joblib")
    feature_names = joblib.load(MODELS_DIR / "feature_names.joblib")
    MODELS_LOADED = True
    LOAD_ERROR = None
except FileNotFoundError as e:
    MODELS_LOADED = False
    LOAD_ERROR = str(e)


class FeatureInput(BaseModel):
    features: list[float] = Field(
        ...,
        min_length=4,
        max_length=4,
        description="[temp_ratio, pressure_ratio, vibration_ratio, gas_ratio]",
    )
    asset_id: str | None = None
    asset_name: str | None = None


def require_models():
    if not MODELS_LOADED:
        raise HTTPException(
            status_code=503,
            detail=f"Models not trained yet. Run `python train.py` first. ({LOAD_ERROR})",
        )


@app.get("/health")
def health():
    return {
        "status": "ok" if MODELS_LOADED else "models_missing",
        "models_loaded": MODELS_LOADED,
        "feature_names": feature_names if MODELS_LOADED else None,
    }


@app.post("/predict-rul")
def predict_rul(payload: FeatureInput):
    require_models()
    X = np.array([payload.features])
    rul_days = float(rul_model.predict(X)[0])
    return {
        "asset_id": payload.asset_id,
        "remaining_useful_life_days": round(rul_days, 1),
        "model": "RandomForestRegressor",
    }


@app.post("/classify-risk")
def classify_risk(payload: FeatureInput):
    require_models()
    X = np.array([payload.features])
    predicted_class = str(risk_model.predict(X)[0])
    proba = risk_model.predict_proba(X)[0]
    proba_map = {cls: round(float(p), 4) for cls, p in zip(risk_model.classes_, proba)}
    return {
        "asset_id": payload.asset_id,
        "risk_class": predicted_class,
        "probabilities": proba_map,
        "model": "RandomForestClassifier",
    }


@app.post("/detect-anomaly")
def detect_anomaly(payload: FeatureInput):
    require_models()
    X = np.array([payload.features])
    score = float(anomaly_model.decision_function(X)[0])
    is_anomaly = score < anomaly_threshold
    return {
        "asset_id": payload.asset_id,
        "is_anomaly": bool(is_anomaly),
        "anomaly_score": round(score, 4),
        "threshold": round(float(anomaly_threshold), 4),
        "model": "IsolationForest",
    }


@app.post("/predict-all")
def predict_all(payload: FeatureInput):
    require_models()
    X = np.array([payload.features])

    rul_days = float(rul_model.predict(X)[0])

    predicted_class = str(risk_model.predict(X)[0])
    proba = risk_model.predict_proba(X)[0]
    proba_map = {cls: round(float(p), 4) for cls, p in zip(risk_model.classes_, proba)}

    score = float(anomaly_model.decision_function(X)[0])
    is_anomaly = score < anomaly_threshold

    return {
        "asset_id": payload.asset_id,
        "asset_name": payload.asset_name,
        "rul": {"remaining_useful_life_days": round(rul_days, 1)},
        "risk": {"risk_class": predicted_class, "probabilities": proba_map},
        "anomaly": {
            "is_anomaly": bool(is_anomaly),
            "anomaly_score": round(score, 4),
            "threshold": round(float(anomaly_threshold), 4),
        },
    }