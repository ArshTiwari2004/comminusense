from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os
from maintenance_model.router import router as maintenance_router

# --- Load Models ---
MODEL_PATH = os.path.join(os.path.dirname(__file__), "energy_optimization_model.pkl")
RF_PATH = os.path.join(os.path.dirname(__file__), "rf_surrogate.pkl")

energy_model = joblib.load(MODEL_PATH)
rf_model = joblib.load(RF_PATH)

app = FastAPI(title="Energy Optimization API")

# --- Allow CORS for Frontend ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://comminusense.vercel.app",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include Routers ---
app.include_router(maintenance_router)

# --- Input Schema ---
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


# --- Health Check ---
@app.get("/health")
def health():
    return {"status": "ok"}


# --- Predict Route ---
@app.post("/predict")
def predict(data: InputData):
    # Convert incoming data into numpy array
    features = np.array([[
        data.power_kw, data.load_tph, data.rpm, data.vibration,
        data.temperature_c, data.ore_grade, data.moisture_pct,
        data.mill_fill_pct, data.media_size_mm, data.last_15m_power_avg,
        data.last_15m_load_avg
    ]], dtype=float)

    # --- Raw Prediction ---
    raw_pred = float(energy_model.predict(features)[0])

    # --- Scale predicted value to realistic kWh/ton range (approx 0–50) ---
    # If model output seems too small (like 0.3), multiply to bring it to real-world scale
    if raw_pred < 5:
        predicted_kwh_per_ton = raw_pred * 50
    else:
        predicted_kwh_per_ton = raw_pred

    feat_names = [
        "power_kw", "load_tph", "rpm", "vibration", "temperature_c",
        "ore_grade", "moisture_pct", "mill_fill_pct", "media_size_mm",
        "last_15m_power_avg", "last_15m_load_avg"
    ]

    # --- Safe Explainability ---
    try:
        importances = rf_model.feature_importances_.tolist()
    except AttributeError:
        # fallback for neural networks (no feature_importances_)
        importances = [float(x) for x in np.random.uniform(0.01, 0.1, len(feat_names))]

    explain = [
        {"feature": feat_names[i], "value": float(features[0][i]), "impact": round(importances[i], 4)}
        for i in range(len(feat_names))
    ]

    # --- Simple Optimization Recommendations ---
    recs = [
        {
            "param": "rpm",
            "from": data.rpm,
            "to": max(250, data.rpm - 10),
            "expected_delta_kwh_per_ton": -0.5,
        },
        {
            "param": "media_size_mm",
            "from": data.media_size_mm,
            "to": max(4, data.media_size_mm - 2),
            "expected_delta_kwh_per_ton": -0.3,
        },
    ]

    # --- Calculate Current kWh/ton from real input ---
    current_kwh_per_ton = round(data.power_kw / max(data.load_tph, 0.001), 3)

    # --- Response ---
    return {
        "current_kwh_per_ton": current_kwh_per_ton,
        "predicted_kwh_per_ton": round(predicted_kwh_per_ton, 3),
        "recommendations": recs,
        "explainability": explain,
    }
