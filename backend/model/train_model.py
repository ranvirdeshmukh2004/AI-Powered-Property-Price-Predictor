"""
Pune EstateLens — XGBoost Model Training Pipeline
===================================================
Trains an XGBoost regression model on the synthetic Pune property dataset.
Uses a Scikit-learn pipeline with preprocessing for categorical and numeric features.

Outputs:
  - Trained pipeline saved to backend/model/xgb_pipeline.joblib
  - Training metrics printed to console
"""

import os
import sys
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    mean_squared_error,
    mean_absolute_error,
    r2_score,
)
from xgboost import XGBRegressor


# ──────────────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────────────

CATEGORICAL_FEATURES = ["corridor", "locality"]
NUMERIC_FEATURES = [
    "bhk", "sqft", "bathrooms", "floor",
    "parking", "gym", "swimming_pool", "garden",
    "security", "clubhouse", "amenities_score",
]

TARGET = "price_lakhs"

XGBOOST_PARAMS = {
    "n_estimators": 500,
    "max_depth": 7,
    "learning_rate": 0.05,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "min_child_weight": 3,
    "reg_alpha": 0.1,
    "reg_lambda": 1.0,
    "random_state": 42,
    "n_jobs": -1,
}


def load_data(data_path=None) -> pd.DataFrame:
    """Load the synthetic dataset."""
    if data_path is None:
        data_path = os.path.join(os.path.dirname(__file__), "..", "data", "pune_properties.csv")
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"❌ Dataset not found at {data_path}. Run generate_dataset.py first or upload a dataset.")
    return pd.read_csv(data_path)


def build_pipeline() -> Pipeline:
    """Build the sklearn preprocessing + XGBoost pipeline."""
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES),
            ("num", StandardScaler(), NUMERIC_FEATURES),
        ],
        remainder="drop",
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("regressor", XGBRegressor(**XGBOOST_PARAMS)),
        ]
    )
    return pipeline


def train_and_evaluate(data_path=None, output_dir=None):
    """Full training pipeline with evaluation."""
    print("=" * 60)
    print("  Pune EstateLens — Model Training")
    print("=" * 60)

    # Load data
    df = load_data(data_path)
    
    # Validation check — Does the dataset contain required columns?
    required_cols = CATEGORICAL_FEATURES + NUMERIC_FEATURES + [TARGET]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise ValueError(f"Dataset is missing required columns: {missing}")
        
    print(f"\n📂 Dataset: {len(df)} records")
    print(f"   Features: {CATEGORICAL_FEATURES + NUMERIC_FEATURES}")
    print(f"   Target: {TARGET}")
    print(f"   Price range: ₹{df[TARGET].min():.1f}L – ₹{df[TARGET].max():.1f}L")

    X = df[CATEGORICAL_FEATURES + NUMERIC_FEATURES]
    y = df[TARGET]

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"\n📊 Split: {len(X_train)} train / {len(X_test)} test")

    # Build and train
    pipeline = build_pipeline()
    print("\n🏋️  Training XGBoost model...")
    pipeline.fit(X_train, y_train)

    # Evaluate
    y_pred_train = pipeline.predict(X_train)
    y_pred_test = pipeline.predict(X_test)

    metrics = {
        "train": {
            "rmse": float(np.sqrt(mean_squared_error(y_train, y_pred_train))),
            "mae": float(mean_absolute_error(y_train, y_pred_train)),
            "r2": float(r2_score(y_train, y_pred_train)),
        },
        "test": {
            "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred_test))),
            "mae": float(mean_absolute_error(y_test, y_pred_test)),
            "r2": float(r2_score(y_test, y_pred_test)),
        },
    }

    print("\n" + "─" * 40)
    print("  📈 Model Performance")
    print("─" * 40)
    for split_name, m in metrics.items():
        print(f"  {split_name.upper():>5s} │ RMSE: {m['rmse']:7.2f}L │ MAE: {m['mae']:7.2f}L │ R²: {m['r2']:.4f}")

    # Cross-validation
    print("\n🔄 Running 5-fold Cross-validation...")
    cv_scores = cross_val_score(
        build_pipeline(), X, y, cv=5, scoring="r2", n_jobs=-1
    )
    print(f"   CV R² scores: {[f'{s:.4f}' for s in cv_scores]}")
    print(f"   CV R² mean:   {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # Save model
    if output_dir is None:
        output_dir = os.path.dirname(__file__)
        
    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, "xgb_pipeline.joblib")
    joblib.dump(pipeline, model_path)
    print(f"\n💾 Model saved to {model_path}")

    # Save metrics
    metrics_path = os.path.join(output_dir, "metrics.json")
    final_metrics = {
        "test_r2": metrics["test"]["r2"],
        "test_rmse_lakhs": round(metrics["test"]["rmse"], 2),
        "cv_r2_mean": float(cv_scores.mean()),
        "full_metrics": metrics
    }
    with open(metrics_path, "w") as f:
        json.dump(final_metrics, f, indent=2)
    print(f"📋 Metrics saved to {metrics_path}")

    # Save locality and corridor lists for the API
    meta = {
        "corridors": sorted(df["corridor"].unique().tolist()),
        "localities": {},
        "features": CATEGORICAL_FEATURES + NUMERIC_FEATURES,
    }
    for corridor in meta["corridors"]:
        meta["localities"][corridor] = sorted(
            df[df["corridor"] == corridor]["locality"].unique().tolist()
        )
    meta_path = os.path.join(output_dir, "model_meta.json")
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)
    print(f"📋 Model metadata saved to {meta_path}")

    print("\n✅ Training complete!")
    return pipeline, final_metrics


if __name__ == "__main__":
    train_and_evaluate()
