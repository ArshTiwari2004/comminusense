from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np
import uvicorn
import math
import pandas as pd # Required for explainability logic

# --- Configuration ---
origins = [
    "http://localhost:3000",
    "https://comminusense.onrender.com",
    "*"
]

# --- Feature List (CRITICAL: MUST match the order used during model training) ---
FEATURES = [
    'power_kw', 'load_tph', 'rpm', 'vibration', 'temperature_c', 
    'ore_grade', 'moisture_pct', 'mill_fill_pct', 'media_size_mm', 
    'last_15m_power_avg', 'last_15m_load_avg'
]

# --- EXTERNAL DATA (REQUIRED) ---
# This data MUST be replaced with statistics derived from your model's training set (X_train).
EXTERNAL_TRAINING_STATS = {
    'power_kw': {'mean': 1200.0, 'std': 50.0},
    'load_tph': {'mean': 52.0, 'std': 5.0},
    'rpm': {'mean': 305.0, 'std': 10.0},
    'vibration': {'mean': 0.03, 'std': 0.01},
    'temperature_c': {'mean': 80.0, 'std': 5.0},
    'ore_grade': {'mean': 0.5, 'std': 0.1},
    'moisture_pct': {'mean': 4.0, 'std': 1.0},
    'mill_fill_pct': {'mean': 80.0, 'std': 5.0},
    'media_size_mm': {'mean': 10.0, 'std': 2.0},
    'last_15m_power_avg': {'mean': 1190.0, 'std': 45.0},
    'last_15m_load_avg': {'mean': 51.5, 'std': 4.5}
}
# Helper to compute current kwh/ton (used in recommend_settings)
def compute_current_kwh(input_dict):
    # TODO: Replace the calculation below with your actual formula for current kwh/ton
    return input_dict['power_kw'] / input_dict['load_tph'] * 0.02 
# -----------------------------------------------------------------------------

# ---------- Load Models ----------
try:
    with open("energy_optimization_model.pkl", "rb") as f:
        model = pickle.load(f) # Base Prediction Model
    with open("rf_surrogate.pkl", "rb") as f:
        rf_model = pickle.load(f) # Surrogate/Optimization Model
except Exception as e:
    print(f"ERROR: Failed to load models: {e}")
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


# ---------- Input Schema (11 machine-related fields) ----------
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


# ========== ANALYSIS FUNCTIONS (Integrated Logic) ============

def generate_recommendations(input_dict, optimized_model, n_recs=2):
    """
    Generates optimization recommendations by grid search over RPM and Media Size.
    """
    # Convert dictionary input to the ordered array required by model
    base_input = np.array([input_dict[f] for f in FEATURES], dtype=np.float32)
    
    # Predict the base prediction using the optimized model
    base_pred = float(optimized_model.predict(base_input.reshape(1,-1))[0][0])
    current_kwh = compute_current_kwh(input_dict)
    
    # search grids
    rpm_candidates = list(range(280, 331, 5))
    media_candidates = list(range(4, 13, 1))
    
    results = []
    for r in rpm_candidates:
        for m in media_candidates:
            cand = base_input.copy()
            # update rpm and media_size columns in the input array
            cand[FEATURES.index("rpm")] = r
            cand[FEATURES.index("media_size_mm")] = m
            
            # Predict candidate optimization
            pred = float(optimized_model.predict(cand.reshape(1,-1))[0][0])
            
            # delta (negative means improvement in kwh/ton)
            delta = pred - base_pred
            results.append((delta, r, m, pred))
            
    results.sort(key=lambda x: x[0])  # Sort by smallest delta first (best improvement)
    
    recs = []
    # Extract only the top n recommendations
    for i in range(min(n_recs, len(results))):
        delta, r, m, pred = results[i]
        
        # Check if the recommendation is actually an improvement (delta < 0)
        if delta >= 0 and i > 0: continue # Skip non-improvements after the first one
            
        recs.append({
            "param": "rpm and media_size_mm", # Combine params for simple frontend display
            "from": f"RPM:{input_dict['rpm']}, Media:{input_dict['media_size_mm']}",
            "to": f"RPM:{int(r)}, Media:{int(m)}",
            "expected_delta_kwh_per_ton": round(float(delta), 4) # 4 decimal places for visibility
        })
        
    # Filter the list down to the best 2 unique parameter changes
    unique_recs = []
    seen_params = set()
    for r in recs:
        param_str = f"{r['to']}"
        if param_str not in seen_params:
            unique_recs.append(r)
            seen_params.add(param_str)
        if len(unique_recs) >= n_recs:
            break
            
    # Modify the output format slightly to better fit the frontend and original notebook intent
    return unique_recs


def generate_explainability(input_dict, prediction_model):
    """
    Generates explainability scores (signed impact) using a global surrogate.
    """
    # Use the external stats for mean/std calculation
    importances = prediction_model.feature_importances_
    
    impacts = []
    for i, feat in enumerate(FEATURES):
        val = input_dict[feat]
        
        # Use EXTERNAL_TRAINING_STATS for mean and std
        mean = EXTERNAL_TRAINING_STATS[feat]['mean']
        std = EXTERNAL_TRAINING_STATS[feat]['std']
        
        # Handle division by zero if std is zero (though MOCK data prevents this)
        z = (val - mean) / std if std > 0 else 0
        
        impact_score = float(importances[i] * z)
        impacts.append((feat, val, impact_score))
        
    # Sort by absolute impact score (highest impact first)
    impacts_sorted = sorted(impacts, key=lambda x: abs(x[2]), reverse=True)[:5]
    
    # return in the desired format
    return [
        {"feature": f, "value": v, "impact": round(float(imp), 4)} 
        for f, v, imp in impacts_sorted
    ]

# =================================================================

# ---------- Routes ----------
@app.get("/")
def home():
    """Simple health check endpoint."""
    return {"message": "Energy Optimization Model API is running and healthy!"}

@app.post("/predict")
def predict_energy(data: InputData):
    """
    Predicts energy metrics and returns complex analysis (recommendations, explainability).
    """
    if model is None or rf_model is None:
        return {
            "current_kwh_per_ton": None, 
            "predicted_kwh_per_ton": None,
            "recommendations": [],
            "explainability": [],
            "error": "Models failed to load on server startup."
        }
        
    # Convert Pydantic object to dictionary for analysis functions
    input_dict = data.model_dump()
        
    # 1. Convert dictionary input to the numpy array (Order MUST match FEATURES list)
    input_data = np.array([[input_dict[f] for f in FEATURES]])

    # 2. Predict the two primary numerical outputs
    current_kwh_raw = model.predict(input_data)[0]
    predicted_kwh_raw = rf_model.predict(input_data)[0]

    # 3. Handle NaN/None values safely
    safe_current_kwh = float(current_kwh_raw) if not math.isnan(float(current_kwh_raw)) else None
    safe_predicted_kwh = float(predicted_kwh_raw) if not math.isnan(float(predicted_kwh_raw)) else None
    
    # 4. Generate Complex Analysis
    recommendations_list = generate_recommendations(input_dict, rf_model)
    explainability_list = generate_explainability(input_dict, model)

    # 5. Return the final structured object
    return {
        "current_kwh_per_ton": safe_current_kwh, 
        "predicted_kwh_per_ton": safe_predicted_kwh,
        "recommendations": recommendations_list,
        "explainability": explainability_list,
    }

# ---------- Run the App ----------
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
