from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import pandas as pd

app = FastAPI(title="NutriLife ML Service")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and encoder
try:
    model = joblib.load("nutrilife_pipeline.pkl")
    target_encoder = joblib.load("target_encoder.pkl")
    print("✅ Model and encoder loaded successfully.")
    print(f"   Diet classes: {list(target_encoder.classes_)}")
except Exception as e:
    model = None
    target_encoder = None
    print(f"❌ Error loading model: {e}")


@app.get("/")
def read_root():
    return {
        "message": "NutriLife ML Recommender API",
        "status": "running",
        "model_loaded": model is not None,
        "diet_classes": list(target_encoder.classes_) if target_encoder else []
    }


@app.post("/predict")
def predict(data: dict):
    """
    Accepts user health data with all 13 features and returns
    the ML-predicted diet recommendation.

    Expected input fields:
    - Age, Gender, Weight_kg, Height_cm, BMI
    - Daily_Caloric_Intake, Cholesterol_mg/dL, Blood_Pressure_mmHg, Glucose_mg/dL
    - Dietary_Restrictions, Allergies, Preferred_Cuisine, Weekly_Exercise_Hours
    """
    if not model or not target_encoder:
        return {"diet": "Balanced", "error": "Model not loaded, returning default"}

    try:
        # Build the input DataFrame matching the training feature order
        input_df = pd.DataFrame([{
            "Age": data.get("Age", 30),
            "Gender": data.get("Gender", "Male"),
            "Weight_kg": data.get("Weight_kg", 70),
            "Height_cm": data.get("Height_cm", 170),
            "BMI": data.get("BMI", round(data.get("Weight_kg", 70) / ((data.get("Height_cm", 170) / 100) ** 2), 1)),
            "Daily_Caloric_Intake": data.get("Daily_Caloric_Intake", 2000),
            "Cholesterol_mg/dL": data.get("Cholesterol_mg/dL", data.get("cholesterol", 180)),
            "Blood_Pressure_mmHg": data.get("Blood_Pressure_mmHg", 120),
            "Glucose_mg/dL": data.get("Glucose_mg/dL", data.get("glucoseLevel", 90)),
            "Dietary_Restrictions": data.get("Dietary_Restrictions", "None"),
            "Allergies": data.get("Allergies", "None"),
            "Preferred_Cuisine": data.get("Preferred_Cuisine", "Indian"),
            "Weekly_Exercise_Hours": data.get("Weekly_Exercise_Hours", 3),
        }])

        # Predict
        prediction = model.predict(input_df)

        # Decode result
        diet = target_encoder.inverse_transform(prediction)
        return {"diet": diet[0]}

    except Exception as e:
        print(f"Prediction error: {e}")
        return {"diet": "Balanced", "error": str(e)}
