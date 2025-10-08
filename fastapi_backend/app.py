# fastapi_backend/app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os

# load models (joblib recommended)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "energy_optimization_model.pkl")
RF_PATH = os.path.join(os.path.dirname(__file__), "rf_surrogate.pkl")
energy_model = joblib.load(MODEL_PATH)
rf_model = joblib.load(RF_PATH)

app = FastAPI(title="Energy Optimization API")

# CORS - set allowed origins (in dev ok to use '*', in prod set your frontend URL)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace with ["https://your-frontend.vercel.app"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InputData(BaseModel):
    power_kw: float
    load_tph: float
    rpm: float
    vibration: float
    temperature_c: float
    ore_grade: float
    moisture_pct: float
    mill_fill_pct: float
    media_size_mm: float
    last_15m_power_avg: float
    last_15m_load_avg: float

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict(data: InputData):
    features = np.array([[data.power_kw, data.load_tph, data.rpm, data.vibration,
                          data.temperature_c, data.ore_grade, data.moisture_pct,
                          data.mill_fill_pct, data.media_size_mm, data.last_15m_power_avg,
                          data.last_15m_load_avg]], dtype=float)
    predicted = float(energy_model.predict(features)[0])
    # simple explainability using rf importances
    feat_names = ["power_kw","load_tph","rpm","vibration","temperature_c","ore_grade",
                  "moisture_pct","mill_fill_pct","media_size_mm","last_15m_power_avg","last_15m_load_avg"]
    importances = rf_model.feature_importances_.tolist()
    explain = [{"feature": feat_names[i], "value": float(features[0][i]), "impact": round(importances[i], 4)}
               for i in range(len(feat_names))]

    # simple recommendations (you can replace with grid-search logic)
    recs = [
        {"param": "rpm", "from": data.rpm, "to": max(250, data.rpm - 10), "expected_delta_kwh_per_ton": -0.5},
        {"param": "media_size_mm", "from": data.media_size_mm, "to": max(4, data.media_size_mm - 2), "expected_delta_kwh_per_ton": -0.3},
    ]

    return {
        "current_kwh_per_ton": round(data.power_kw / max(data.load_tph, 0.001), 3),
        "predicted_kwh_per_ton": round(predicted, 3),
        "recommendations": recs,
        "explainability": explain
    }
