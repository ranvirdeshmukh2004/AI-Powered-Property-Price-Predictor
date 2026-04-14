# 🏙️ Pune EstateLens — AI-Powered Property Price Predictor

<p align="center">
  <strong>Intelligent Property Valuations for Pune's Growth Corridors</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/XGBoost-2.1-blue" alt="XGBoost" />
  <img src="https://img.shields.io/badge/Python-3.9+-3776AB?logo=python" alt="Python" />
</p>

---

## 📋 Overview

**Pune EstateLens** is a full-stack web application that provides real-time AI-driven residential property valuations across Pune's two fastest-growing corridors:

| Corridor | Direction | Key Localities |
|----------|-----------|---------------|
| **Dehu Road → Solapur Road** | West → Southeast | Dehu Road, Kiwale, Ravet, Wakad, Baner, Hadapsar, Manjri, Loni Kalbhor, Uruli Kanchan |
| **Kolhapur Road → Nashik Road** | South → North | Khed Shivapur, Sinhagad Road, Hinjewadi, Balewadi, Chakan, Bhosari, Moshi, Alandi |

### Key Features

- 🏠 **Predictive Engine** — Input property specs (BHK, sq.ft., bathrooms, floor, amenities) and get instant valuations in ₹ Lakhs
- 🔄 **Corridor Comparison** — "What If" feature shows how the same property would be priced in the alternate corridor
- 📊 **Market Dashboard** — Interactive charts visualizing price trends, BHK comparisons, and amenity impact analysis
- 🎨 **Premium UI** — Dark glassmorphism design with smooth animations, gradient accents, and responsive layout

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | Single-page application |
| **Styling** | Tailwind CSS v3 | Responsive, utility-first styling |
| **Charts** | Recharts | Interactive data visualizations |
| **Icons** | Lucide React | Consistent icon system |
| **Backend** | FastAPI (Python) | REST API serving predictions |
| **ML Model** | XGBoost + Scikit-learn | Regression model for price prediction |
| **Data** | Pandas + NumPy | Dataset generation and processing |

---

## 🚀 Quick Start

### Prerequisites

- **Python** 3.9+
- **Node.js** 18+ (with npm)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AI-Powered-Property-Price-Predictor
```

### 2. Backend Setup

```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Generate the synthetic dataset
cd backend/data
python generate_dataset.py

# Train the XGBoost model
cd ../model
python train_model.py

# Start the FastAPI server
cd ..
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. You can explore the auto-generated docs at `http://localhost:8000/docs`.

### 3. Frontend Setup

```bash
# Install Node dependencies
cd frontend
npm install

# Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🧠 Machine Learning Model

### Architecture

The price prediction engine uses an **XGBoost Regressor** wrapped in a Scikit-learn pipeline:

```
Input Features → ColumnTransformer → XGBRegressor → Price (₹ Lakhs)
                  ├─ OneHotEncoder (corridor, locality)
                  └─ StandardScaler (numeric features)
```

### Features

| Feature | Type | Description |
|---------|------|-------------|
| `corridor` | Categorical | Growth corridor identifier |
| `locality` | Categorical | Specific neighborhood |
| `bhk` | Integer (1–4) | Bedroom-Hall-Kitchen configuration |
| `sqft` | Integer (300–3500) | Total carpet area |
| `bathrooms` | Integer (1–4) | Number of bathrooms |
| `floor` | Integer (0–25) | Floor level |
| `parking` | Binary (0/1) | Parking availability |
| `gym` | Binary (0/1) | Gym facility |
| `swimming_pool` | Binary (0/1) | Swimming pool |
| `garden` | Binary (0/1) | Garden/landscaping |
| `security` | Binary (0/1) | 24/7 security |
| `clubhouse` | Binary (0/1) | Clubhouse facility |
| `amenities_score` | Integer (0–6) | Sum of all amenity flags |

### Performance

| Metric | Train | Test |
|--------|-------|------|
| **RMSE** | 2.46 L | 11.92 L |
| **MAE** | 1.87 L | 8.37 L |
| **R²** | 0.9963 | 0.9079 |
| **CV R² (5-fold)** | — | 0.9059 ± 0.008 |

### Dataset

The training dataset consists of **2,000 synthetic property records** generated from real market research data:

- **Price calibration**: Based on actual per-sq.ft. rates from real estate portals (MagicBricks, NoBroker, Housing.com, 99acres)
- **Price modifiers**: Floor premium (+0.4%/floor), amenity premiums (1.5–3% each), BHK efficiency scaling
- **Distribution**: 52% Dehu–Solapur corridor, 48% Kolhapur–Nashik corridor
- **Price range**: ₹18.8L – ₹311.7L

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check with model metrics |
| `GET` | `/api/meta` | Model metadata (corridors, localities) |
| `POST` | `/api/predict` | Single property valuation |
| `POST` | `/api/compare` | Compare price across both corridors |
| `GET` | `/api/stats` | Aggregate market statistics |
| `GET` | `/api/amenity-impact` | Amenity impact analysis data |

### Example Request

```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "corridor": "dehu_solapur",
    "locality": "Baner",
    "bhk": 3,
    "sqft": 1400,
    "bathrooms": 2,
    "floor": 8,
    "parking": 1,
    "gym": 1,
    "swimming_pool": 0,
    "garden": 0,
    "security": 1,
    "clubhouse": 0
  }'
```

### Example Response

```json
{
  "predicted_price_lakhs": 112.91,
  "price_per_sqft": 8065,
  "corridor": "dehu_solapur",
  "locality": "Baner",
  "confidence_band": {
    "low": 103.88,
    "high": 121.94
  },
  "input_summary": {
    "bhk": 3,
    "sqft": 1400,
    "bathrooms": 2,
    "floor": 8,
    "amenities_score": 3
  }
}
```

---

## 📁 Project Structure

```
AI-Powered-Property-Price-Predictor/
├── backend/
│   ├── main.py                    # FastAPI application
│   ├── requirements.txt           # Python dependencies
│   ├── data/
│   │   ├── generate_dataset.py    # Synthetic data generator
│   │   └── pune_properties.csv    # Generated dataset
│   └── model/
│       ├── train_model.py         # XGBoost training pipeline
│       ├── xgb_pipeline.joblib    # Serialized trained model
│       ├── metrics.json           # Training metrics
│       └── model_meta.json        # Model metadata
├── frontend/
│   ├── index.html                 # HTML entry point
│   ├── package.json               # Node dependencies
│   ├── tailwind.config.js         # Tailwind design system
│   ├── public/
│   │   └── favicon.svg            # Custom favicon
│   └── src/
│       ├── main.jsx               # React entry point
│       ├── App.jsx                # Root application component
│       ├── index.css              # Global styles + design system
│       ├── api.js                 # API service layer
│       └── components/
│           ├── Header.jsx         # Navigation + corridor toggle
│           ├── PredictionForm.jsx # Property input form
│           ├── PredictionResult.jsx # Price display + comparison
│           ├── Dashboard.jsx      # Charts + analytics
│           └── Footer.jsx         # Footer with credits
├── .gitignore
└── README.md
```

---

## 📜 License

This project is built for educational and demonstration purposes  

---

<p align="center">
  Built with ❤️ for Pune's real estate market
</p>
