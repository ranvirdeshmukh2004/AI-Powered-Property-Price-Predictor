"""
Pune EstateLens — FastAPI Backend
==================================
REST API for property price prediction serving an XGBoost model.

Endpoints:
  POST /api/predict     — Single property valuation
  POST /api/compare     — Side-by-side corridor comparison
  GET  /api/stats       — Aggregate market statistics
  GET  /api/amenity-impact — Amenity impact analysis data
  GET  /api/meta        — Model metadata (corridors, localities)
  GET  /api/health      — Health check
"""

import os
import json
import shutil
import traceback
from typing import Optional, List
from contextlib import asynccontextmanager

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from model.train_model import train_and_evaluate


# ──────────────────────────────────────────────────────────
# Global state
# ──────────────────────────────────────────────────────────

MODEL = None
DATASET = None
MODEL_META = None
MODEL_METRICS = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "xgb_pipeline.joblib")
DATA_PATH = os.path.join(BASE_DIR, "data", "pune_properties.csv")
META_PATH = os.path.join(BASE_DIR, "model", "model_meta.json")
METRICS_PATH = os.path.join(BASE_DIR, "model", "metrics.json")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model and data on startup."""
    global MODEL, DATASET, MODEL_META, MODEL_METRICS

    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f"Model not found at {MODEL_PATH}. Run train_model.py first.")

    MODEL = joblib.load(MODEL_PATH)
    DATASET = pd.read_csv(DATA_PATH)

    with open(META_PATH) as f:
        MODEL_META = json.load(f)

    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH) as f:
            MODEL_METRICS = json.load(f)

    print("✅ Model and data loaded successfully")
    yield
    print("🛑 Shutting down")


# ──────────────────────────────────────────────────────────
# App setup
# ──────────────────────────────────────────────────────────

app = FastAPI(
    title="Pune EstateLens API",
    description="AI-powered property price prediction for Pune growth corridors",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────────────────
# Request/Response schemas
# ──────────────────────────────────────────────────────────

class PropertyInput(BaseModel):
    corridor: str = Field(..., description="Growth corridor ID")
    locality: str = Field(..., description="Locality name within the corridor")
    bhk: int = Field(..., ge=1, le=4, description="Number of bedrooms")
    sqft: int = Field(..., ge=300, le=3500, description="Total area in square feet")
    bathrooms: int = Field(..., ge=1, le=4, description="Number of bathrooms")
    floor: int = Field(..., ge=0, le=30, description="Floor level")
    parking: int = Field(0, ge=0, le=1)
    gym: int = Field(0, ge=0, le=1)
    swimming_pool: int = Field(0, ge=0, le=1)
    garden: int = Field(0, ge=0, le=1)
    security: int = Field(0, ge=0, le=1)
    clubhouse: int = Field(0, ge=0, le=1)

    @field_validator("corridor")
    @classmethod
    def validate_corridor(cls, v):
        valid = ["dehu_solapur", "kolhapur_nashik"]
        if v not in valid:
            raise ValueError(f"corridor must be one of {valid}")
        return v


class PredictionResponse(BaseModel):
    predicted_price_lakhs: float
    price_per_sqft: float
    corridor: str
    locality: str
    confidence_band: dict  # {"low": float, "high": float}
    input_summary: dict


class ComparisonResponse(BaseModel):
    primary: PredictionResponse
    alternative: PredictionResponse
    price_difference_lakhs: float
    price_difference_percent: float


# ──────────────────────────────────────────────────────────
# Prediction logic
# ──────────────────────────────────────────────────────────

def predict_price(prop: PropertyInput) -> PredictionResponse:
    """Run the model on a single property input."""
    amenities_score = prop.parking + prop.gym + prop.swimming_pool + prop.garden + prop.security + prop.clubhouse

    input_df = pd.DataFrame([{
        "corridor": prop.corridor,
        "locality": prop.locality,
        "bhk": prop.bhk,
        "sqft": prop.sqft,
        "bathrooms": prop.bathrooms,
        "floor": prop.floor,
        "parking": prop.parking,
        "gym": prop.gym,
        "swimming_pool": prop.swimming_pool,
        "garden": prop.garden,
        "security": prop.security,
        "clubhouse": prop.clubhouse,
        "amenities_score": amenities_score,
    }])

    prediction = float(MODEL.predict(input_df)[0])
    prediction = round(max(prediction, 5.0), 2)

    price_per_sqft = round((prediction * 100000) / prop.sqft, 0)

    # Confidence band: ±8% (approximate model uncertainty)
    confidence = {
        "low": round(prediction * 0.92, 2),
        "high": round(prediction * 1.08, 2),
    }

    return PredictionResponse(
        predicted_price_lakhs=prediction,
        price_per_sqft=price_per_sqft,
        corridor=prop.corridor,
        locality=prop.locality,
        confidence_band=confidence,
        input_summary={
            "bhk": prop.bhk,
            "sqft": prop.sqft,
            "bathrooms": prop.bathrooms,
            "floor": prop.floor,
            "amenities_score": amenities_score,
        },
    )


# ──────────────────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────────────────

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": MODEL is not None,
        "dataset_size": len(DATASET) if DATASET is not None else 0,
        "metrics": MODEL_METRICS,
    }


@app.get("/api/meta")
async def get_model_meta():
    """Return model metadata — corridors, localities, features."""
    return MODEL_META


@app.post("/api/predict", response_model=PredictionResponse)
async def predict(prop: PropertyInput):
    """Predict property price for a single configuration."""
    try:
        return predict_price(prop)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/compare", response_model=ComparisonResponse)
async def compare(prop: PropertyInput):
    """Compare property price across both corridors."""
    # Predict for primary corridor
    primary = predict_price(prop)

    # Determine alternative corridor
    alt_corridor = "kolhapur_nashik" if prop.corridor == "dehu_solapur" else "dehu_solapur"

    # Pick a comparable locality in the alternative corridor
    alt_localities = MODEL_META["localities"][alt_corridor]

    # Find the locality with the most similar base rate
    # Use the first locality as default
    alt_locality = alt_localities[0]

    # Create alternative input
    alt_prop = prop.model_copy()
    alt_prop.corridor = alt_corridor
    alt_prop.locality = alt_locality

    alternative = predict_price(alt_prop)

    diff = round(primary.predicted_price_lakhs - alternative.predicted_price_lakhs, 2)
    avg = (primary.predicted_price_lakhs + alternative.predicted_price_lakhs) / 2
    diff_pct = round((diff / avg) * 100, 1) if avg > 0 else 0.0

    return ComparisonResponse(
        primary=primary,
        alternative=alternative,
        price_difference_lakhs=diff,
        price_difference_percent=diff_pct,
    )


@app.get("/api/stats")
async def get_stats():
    """Return aggregate statistics for dashboard charts."""
    df = DATASET

    # Average price per sqft by locality
    df["price_per_sqft"] = (df["price_lakhs"] * 100000) / df["sqft"]

    locality_stats = (
        df.groupby(["corridor", "locality"])
        .agg(
            avg_price=("price_lakhs", "mean"),
            avg_price_per_sqft=("price_per_sqft", "mean"),
            count=("price_lakhs", "count"),
            min_price=("price_lakhs", "min"),
            max_price=("price_lakhs", "max"),
        )
        .round(2)
        .reset_index()
        .to_dict(orient="records")
    )

    # Average price by BHK and corridor
    bhk_stats = (
        df.groupby(["corridor", "bhk"])
        .agg(
            avg_price=("price_lakhs", "mean"),
            avg_sqft=("sqft", "mean"),
        )
        .round(2)
        .reset_index()
        .to_dict(orient="records")
    )

    # Corridor-level summary
    corridor_summary = (
        df.groupby("corridor")
        .agg(
            avg_price=("price_lakhs", "mean"),
            median_price=("price_lakhs", "median"),
            avg_price_per_sqft=("price_per_sqft", "mean"),
            total_listings=("price_lakhs", "count"),
        )
        .round(2)
        .reset_index()
        .to_dict(orient="records")
    )

    return {
        "locality_stats": locality_stats,
        "bhk_stats": bhk_stats,
        "corridor_summary": corridor_summary,
    }


@app.get("/api/amenity-impact")
async def get_amenity_impact():
    """Calculate the impact of each amenity on property prices."""
    df = DATASET.copy()
    amenities = ["parking", "gym", "swimming_pool", "garden", "security", "clubhouse"]
    df["price_per_sqft"] = (df["price_lakhs"] * 100000) / df["sqft"]

    impact_data = []
    for amenity in amenities:
        with_amenity = df[df[amenity] == 1]["price_per_sqft"].mean()
        without_amenity = df[df[amenity] == 0]["price_per_sqft"].mean()
        premium_pct = ((with_amenity - without_amenity) / without_amenity) * 100

        impact_data.append({
            "amenity": amenity.replace("_", " ").title(),
            "amenity_key": amenity,
            "avg_with": round(with_amenity, 0),
            "avg_without": round(without_amenity, 0),
            "premium_percent": round(premium_pct, 2),
        })

    # Sort by impact
    impact_data.sort(key=lambda x: x["premium_percent"], reverse=True)
    return impact_data


@app.post("/api/retrain")
async def retrain_model(file: UploadFile = File(...)):
    """Dynamically retrain the XGBoost model with a user-uploaded CSV, utilizing a Safe Fallback mechanism."""
    global MODEL, DATASET, MODEL_META, MODEL_METRICS
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
        
    staging_dir = os.path.join(BASE_DIR, "staging")
    os.makedirs(staging_dir, exist_ok=True)
    
    staging_data_path = os.path.join(staging_dir, "staged_dataset.csv")
    staging_model_dir = os.path.join(staging_dir, "model")
    
    try:
        # Save the uploaded file to staging
        content = await file.read()
        with open(staging_data_path, "wb") as f:
            f.write(content)
            
        # Attempt to train the model entirely in isolation
        print("🚀 Initiating Safe Fallback Retraining...")
        pipeline, metrics = train_and_evaluate(
            data_path=staging_data_path, 
            output_dir=staging_model_dir
        )
        
        # If we got here, it succeeded! It's safe to overwrite live files
        print("✅ Training succeeded. Swapping to new model.")
        
        # 1. Update source data
        shutil.copy2(staging_data_path, DATA_PATH)
        
        # 2. Update model artifacts
        shutil.copy2(os.path.join(staging_model_dir, "xgb_pipeline.joblib"), MODEL_PATH)
        shutil.copy2(os.path.join(staging_model_dir, "metrics.json"), METRICS_PATH)
        shutil.copy2(os.path.join(staging_model_dir, "model_meta.json"), META_PATH)
        
        # 3. Hot-reload memory state for live users
        MODEL = joblib.load(MODEL_PATH)
        DATASET = pd.read_csv(DATA_PATH)
        with open(META_PATH) as f:
            MODEL_META = json.load(f)
        with open(METRICS_PATH) as f:
            MODEL_METRICS = json.load(f)
            
        return {"status": "success", "metrics": metrics, "message": "Model retrained and deployed successfully!"}
        
    except Exception as e:
        print(f"❌ Retraining failed! Error: {str(e)}")
        # Print stack trace to log
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Training Failed: {str(e)}")
        
    finally:
        # Always clean up the staging directory when done
        if os.path.exists(staging_dir):
            shutil.rmtree(staging_dir)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
