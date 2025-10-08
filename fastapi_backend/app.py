from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # Import CORS middleware
from pydantic import BaseModel
import pickle
import numpy as np
import uvicorn
import logging

# Set up logging for better error visibility in Render logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------- Load Model ----------
try:
    with open("energy_optimization_model.pkl", "rb") as f:
        model = pickle.load(f)
    with open("rf_surrogate.pkl", "rb") as f:
        rf_model = pickle.load(f)
    logger.info("Models loaded successfully.")
except Exception as e:
    logger.error(f"Error loading models: {e}")
    # Note: If model loading fails, the app might start but fail on /predict

app = FastAPI()

# ---------- CORS Configuration ----------
# List of origins (frontend URLs) allowed to make requests
origins = [
    "http://localhost:3000",
    "http://localhost:3001",  # Common local development port
    "https://comminusense.onrender.com",
    # Add your deployed Next.js URL here if you deploy the frontend later (e.g., Vercel or other Render service)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (POST, GET, etc.)
    allow_headers=["*"],  # Allows all request headers
)
logger.info(f"CORS configured to allow origins: {origins}")

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
    """Simple health check endpoint."""
    return {"message": "Energy Optimization Model API running!"}

@app.post("/predict")
def predict_energy(data: EnergyInput):
    """
    Accepts energy data input and returns predicted efficiency and optimized output.
    """
    try:
        # Convert input to numpy array
        input_data = np.array([[
            data.temperature_c, 
            data.humidity_percent, 
            data.pressure_pa,
            data.wind_speed_mps, 
            data.solar_irradiance_wm2
        ]])

        # Predict efficiency or energy output
        # Ensure models are loaded before prediction
        if 'model' in locals() and 'rf_model' in locals():
            efficiency = model.predict(input_data)[0]
            optimized_output = rf_model.predict(input_data)[0]
        else:
            logger.error("Attempted prediction but models were not loaded.")
            return {"error": "Models failed to load during startup."}, 500


        return {
            "predicted_efficiency": float(efficiency),
            "optimized_output": float(optimized_output)
        }
    except Exception as e:
        logger.error(f"Error during prediction: {e}")
        return {"error": str(e)}, 500

# ---------- Run the App (Only for Local Development) ----------
# Render ignores this block and uses the Start Command specified in the dashboard
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
