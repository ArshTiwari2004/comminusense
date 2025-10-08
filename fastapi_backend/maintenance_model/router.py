from fastapi import APIRouter
from pydantic import BaseModel
import joblib
import numpy as np
import os

# Define router
router = APIRouter(prefix="/maintenance", tags=["Maintenance Alerts"])

# Load model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "maintenance_model.pkl")
maintenance_model = joblib.load(MODEL_PATH)

# Define input structure (matching frontend)
class MaintenanceInput(BaseModel):
    vibration: float
    temperature_c: float
    rpm: float
    power_kw: float
    age_hours: float
    historical_failures: int

@router.post("/alert")
def maintenance_alert(data: MaintenanceInput):
    # Convert inputs to numpy array
    features = np.array([[data.vibration,
                          data.temperature_c,
                          data.rpm,
                          data.power_kw,
                          data.age_hours,
                          data.historical_failures]], dtype=float)

    # Predict risk score
    prediction = float(maintenance_model.predict(features)[0])

    # Determine alert level
    if prediction > 0.75:
        alert_level = "Critical"
        color = "red"
        action = "Immediate inspection required!"
    elif prediction > 0.5:
        alert_level = "Warning"
        color = "orange"
        action = "Schedule maintenance soon."
    else:
        alert_level = "Normal"
        color = "green"
        action = "Machine operating normally."

    # Build recommendations
    recommendations = [
        {"param": "vibration", "value": data.vibration, "suggestion": "Check alignment if vibration > 0.03"},
        {"param": "temperature_c", "value": data.temperature_c, "suggestion": "Ensure cooling system efficiency"},
        {"param": "historical_failures", "value": data.historical_failures, "suggestion": "Review failure logs and replace aging components"}
    ]

    # Return the response
    return {
        "alert_level": alert_level,
        "maintenance_risk_score": round(prediction, 3),
        "status_color": color,
        "primary_action": action,
        "recommendations": recommendations
    }
