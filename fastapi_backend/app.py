from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np
import uvicorn
import math # Used to check for NaN values from model

# --- Configuration ---
# Set the allowed origins for CORS. Add your frontend's deployment URL here.
origins = [
    "http://localhost:3000",
    "https://comminusense.onrender.com",
    "*" # Highly permissive for initial testing on Canvas, refine later
]

# ---------- Load Models ----------
# NOTE: Ensure these .pkl files are in the same directory as app.py
try:
    with open("energy_optimization_model.pkl", "rb") as f:
        model = pickle.load(f)
    with open("rf_surrogate.pkl", "rb") as f:
        rf_model = pickle.load(f)
except Exception as e:
    print(f"ERROR: Failed to load models: {e}")
    # Set models to None so app can still start
    model = None
    rf_model = None


app = FastAPI(title="Energy Optimization Predictor")

# --- Add CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Input Schema (CORRECTED to 11 machine-related fields) ----------
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


# ---------- Routes ----------
@app.get("/")
def home():
    """Simple health check endpoint."""
    return {"message": "Energy Optimization Model API is running and healthy!"}

@app.post("/predict")
def predict_energy(data: InputData):
    """
    Predicts efficiency and optimized output based on the 11 input parameters.
    """
    if model is None or rf_model is None:
         return {
            "predicted_efficiency": None, 
            "optimized_output": None,
            "error": "Models failed to load on server startup."
         }
         
    # 1. Convert input to numpy array (Order must match the 11-field training data)
    input_data = np.array([[
        data.power_kw, 
        data.load_tph, 
        data.rpm, 
        data.vibration,
        data.temperature_c, 
        data.ore_grade, 
        data.moisture_pct,
        data.mill_fill_pct, 
        data.media_size_mm, 
        data.last_15m_power_avg,
        data.last_15m_load_avg
    ]])

    # 2. Predict using both models
    # Assuming 'model' predicts efficiency and 'rf_model' predicts optimized output
    efficiency_raw = model.predict(input_data)[0]
    optimized_output_raw = rf_model.predict(input_data)[0]

    # 3. Handle NaN/None values safely (converts NaN to Python None/JSON null)
    safe_efficiency = float(efficiency_raw)
    safe_output = float(optimized_output_raw)

    safe_efficiency = safe_efficiency if not math.isnan(safe_efficiency) else None
    safe_output = safe_output if not math.isnan(safe_output) else None

    # 4. Return results (including empty lists for frontend stability)
    return {
        "predicted_efficiency": safe_efficiency, 
        "optimized_output": safe_output,
        # Frontend stability fix: return empty arrays if the model doesn't generate them
        "recommendations": [],
        "explainability": []
    }
