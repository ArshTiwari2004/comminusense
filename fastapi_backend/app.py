# app.py
from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import numpy as np
import uvicorn

# ---------- Load Model ----------
with open("energy_optimization_model.pkl", "rb") as f:
    model = pickle.load(f)
with open("rf_surrogate.pkl", "rb") as f:
    rf_model = pickle.load(f)

app = FastAPI()

# ---------- Input Schema ----------
class EnergyInput(BaseModel):
    temperature_c: float
    humidity_percent: float
    pressure_pa: float
    wind_speed_mps: float
    solar_irradiance_wm2: float

# ---------- Routes ----------
@app.get("/")
def home():
    return {"message": "Energy Optimization Model API running!"}

@app.post("/predict")
def predict_energy(data: EnergyInput):
    # Convert input to numpy array
    input_data = np.array([[data.temperature_c, data.humidity_percent, data.pressure_pa,
                            data.wind_speed_mps, data.solar_irradiance_wm2]])

    # Predict efficiency or energy output
    efficiency = model.predict(input_data)[0]
    optimized_output = rf_model.predict(input_data)[0]

    return {
        "predicted_efficiency": float(efficiency),
        "optimized_output": float(optimized_output)
    }

# ---------- Run the App ----------
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
