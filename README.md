# 🏙️ Pune EstateLens — AI-Powered Property Price Predictor

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=for-the-badge" />
  <img src="https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white&style=for-the-badge" />
  <img src="https://img.shields.io/badge/XGBoost-E83924?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white&style=for-the-badge" />
  <img src="https://img.shields.io/badge/Deployed-Render%20%2B%20Vercel-brightgreen?style=for-the-badge" />
</p>

<p align="center">
  <strong>🌐 Live Demo: <a href="https://ai-powered-property-price-predictor.vercel.app">ai-powered-property-price-predictor.vercel.app</a></strong><br/>
  <strong>⚙️ API: <a href="https://estatelens-backend.onrender.com/docs">estatelens-backend.onrender.com/docs</a></strong>
</p>

---

## 📋 What is Pune EstateLens?

**Pune EstateLens** is a production-grade, full-stack AI web application that delivers real-time residential property price predictions across Pune's two fastest-growing real estate corridors. The system combines an XGBoost machine learning model with a modern React frontend, a FastAPI REST backend, and MongoDB Atlas for persistent prediction analytics.

> Built as a complete end-to-end ML product — from data generation and model training to cloud deployment with a premium UI.

---

## 🏘️ Covered Corridors

| Corridor | Direction | Key Localities |
|----------|-----------|----------------|
| **Dehu Road → Solapur Road** | West → Southeast | Dehu Road, Kiwale, Ravet, Wakad, Baner, Hadapsar, Manjri, Loni Kalbhor, Uruli Kanchan |
| **Kolhapur Road → Nashik Road** | South → North | Khed Shivapur, Sinhagad Road, Hinjewadi, Balewadi, Chakan, Bhosari, Moshi, Alandi |

These two corridors represent Pune's highest infrastructure investment zones (metro, IT parks, ring roads), making them ideal for property price modeling.

---

## ✨ Features

### 🏠 1. AI Valuation Engine (Valuation Page)
The core feature. Enter property specifications and receive an instant AI-generated valuation.

**Inputs accepted:**
- Growth corridor (Dehu-Solapur vs Kolhapur-Nashik)
- Locality (dynamically populated based on corridor)
- BHK configuration (1–4 BHK)
- Total area in sq.ft. (300–3500)
- Number of bathrooms (1–4)
- Floor level (0–30)
- Amenities: Parking, Gym, Swimming Pool, Garden, Security, Clubhouse

**Output delivered:**
- 💰 **Predicted price in ₹ Lakhs** (e.g., ₹72.5L)
- 📏 **Price per sq.ft.** (e.g., ₹7,631/sqft)
- 🎯 **Confidence band** (±8% range: e.g., ₹66.7L – ₹78.3L)
- 📊 **Market comparison charts** (BHK trends, locality benchmarks, amenity impact)

### 🗺️ 2. Interactive Map View (Map Page)
- Leaflet.js powered dark-mode map with CartoDB DarkMatter tiles
- Toggle between both corridors with visual route overlays
- Custom glowing markers for each locality
- Click markers to see locality-level price statistics

### 🔄 3. Corridor Comparison (Compare Page)
- Enter a property configuration once
- Instantly compare what the same property would cost in the alternative corridor
- Price difference in ₹ Lakhs and percentage shown side by side

### 🎨 4. Aesthetics Page
- Real-time animated isometric 3D building visualization built entirely with native HTML5 Canvas 2D API (no heavy 3D libraries)
- Floating "AI CORE" orb with glow effects, particle systems, and animated grid
- Property image gallery of premium real estate

### 📜 5. Prediction History (History Page — MongoDB)
- All predictions are automatically logged to MongoDB Atlas
- Scatter chart showing Price vs. Area correlation colored by corridor
- Side-by-side corridor comparison cards with average predicted price, count, min/max
- Full sortable prediction table with timestamp, locality, BHK, floor, amenities, price

### 🔁 6. Model Administration (Data & Model Page)
- Upload a new `.csv` dataset to retrain the XGBoost model live
- **Safe Fallback system**: staging environment used for training — if training fails, previous model stays live (zero downtime)
- Post-retraining metrics (R², RMSE) displayed instantly
- Required CSV schema documented in the UI

---

## 🧠 Machine Learning System (Deep Dive)

### Dataset

The model is trained on a synthetic dataset of **2,000+ Pune residential property records** generated using realistic pricing distributions based on Pune's actual real estate market dynamics (corridor premiums, locality tiers, amenity multipliers, floor pricing).

| Field | Type | Description |
|-------|------|-------------|
| `corridor` | categorical | `dehu_solapur` or `kolhapur_nashik` |
| `locality` | categorical | One of 17 localities |
| `bhk` | integer | Bedroom count (1–4) |
| `sqft` | integer | Total carpet area (300–3500) |
| `bathrooms` | integer | Bathroom count (1–4) |
| `floor` | integer | Floor level (0–30) |
| `parking` | binary | 0 or 1 |
| `gym` | binary | 0 or 1 |
| `swimming_pool` | binary | 0 or 1 |
| `garden` | binary | 0 or 1 |
| `security` | binary | 0 or 1 |
| `clubhouse` | binary | 0 or 1 |
| `amenities_score` | integer | Sum of all amenity flags (derived) |
| `price_lakhs` | float | **Target variable** |

### Preprocessing Pipeline

Built using **scikit-learn's `Pipeline` + `ColumnTransformer`**:

```
Raw Input (13 features)
        │
        ▼
┌──────────────────────────────────────┐
│         ColumnTransformer            │
│  ┌──────────────────┐  ┌──────────┐  │
│  │  OneHotEncoder   │  │ Standard │  │
│  │ (corridor,       │  │ Scaler   │  │
│  │  locality)       │  │(numeric  │  │
│  └──────────────────┘  │ features)│  │
│                        └──────────┘  │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│         XGBRegressor                 │
│  n_estimators=500, max_depth=7       │
│  learning_rate=0.05, subsample=0.8   │
│  colsample_bytree=0.8                │
│  reg_alpha=0.1, reg_lambda=1.0       │
└──────────────────────────────────────┘
        │
        ▼
    prediction (₹ Lakhs)
```

### Model Performance

| Metric | Train | Test |
|--------|-------|------|
| **R² Score** | ~0.97 | ~0.91 |
| **RMSE** | ~5.2L | ~8.4L |
| **MAE** | ~3.8L | ~6.1L |
| **5-Fold CV R²** | 0.91 ± 0.02 | — |

### Why XGBoost?

| Property | Benefit |
|----------|---------|
| Handles mixed feature types | Both categorical (locality, corridor) and numeric (sqft, floor) natively |
| Non-linear relationships | Floor-price interactions, locality premiums, amenity stacking effects |
| Robust to outliers | Real estate data inherently has premium outliers |
| Feature importance | Can explain which features drive the price most |
| Fast inference | Sub-millisecond predictions suitable for real-time API responses |

### Confidence Band

The system reports a **±8% confidence interval** around every prediction. This is the empirically observed MAPE (Mean Absolute Percentage Error) of the model on the test set, providing users with realistic uncertainty bounds rather than false precision.

---

## 🛠️ Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend Framework** | React | 19 | Component-based SPA |
| **Build Tool** | Vite | 8 | Dev server + production bundler |
| **Styling** | Tailwind CSS | 3 | Utility-first design system |
| **Charts** | Recharts | 3 | Interactive data visualization |
| **Maps** | React Leaflet | 5 | Corridor map with markers |
| **Icons** | Lucide React | 1.8 | Consistent icon system |
| **Routing** | React Router | 7 | SPA client-side routing |
| **Backend** | FastAPI | 0.115 | Async REST API |
| **ML Model** | XGBoost | 2+ | Gradient boosted regression |
| **ML Pipeline** | Scikit-learn | 1.8 | Preprocessing + pipeline |
| **Database** | MongoDB Atlas | — | Prediction log persistence |
| **DB Driver** | PyMongo | 4.16 | MongoDB Python driver |
| **Data** | Pandas + NumPy | — | Data manipulation |
| **Deployment** | Render + Vercel | — | Cloud hosting |

---

## 📡 REST API Reference

Base URL (production): `https://estatelens-backend.onrender.com`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | None | Server health + MongoDB status |
| `GET` | `/api/meta` | None | Available corridors and localities |
| `POST` | `/api/predict` | None | Get AI price prediction |
| `POST` | `/api/compare` | None | Compare same property across corridors |
| `GET` | `/api/stats` | None | Market statistics (avg price per locality, BHK) |
| `GET` | `/api/amenity-impact` | None | Price premium per amenity type |
| `GET` | `/api/history` | None | Last 50 predictions from MongoDB |
| `GET` | `/api/history/corridor-stats` | None | Corridor aggregation from history |
| `POST` | `/api/retrain` | None | Upload CSV to retrain model |

### Sample Predict Request

```json
POST /api/predict
{
  "corridor": "dehu_solapur",
  "locality": "Wakad",
  "bhk": 2,
  "sqft": 950,
  "bathrooms": 2,
  "floor": 5,
  "parking": 1,
  "gym": 1,
  "swimming_pool": 0,
  "garden": 0,
  "security": 1,
  "clubhouse": 0
}
```

### Sample Predict Response

```json
{
  "predicted_price_lakhs": 72.5,
  "price_per_sqft": 7631.0,
  "corridor": "dehu_solapur",
  "locality": "Wakad",
  "confidence_band": { "low": 66.7, "high": 78.3 },
  "input_summary": {
    "bhk": 2,
    "sqft": 950,
    "bathrooms": 2,
    "floor": 5,
    "amenities_score": 3
  }
}
```

---

## 🗂️ Project Structure

```
AI-Powered-Property-Price-Predictor/
│
├── backend/                          # FastAPI Python backend
│   ├── data/
│   │   ├── generate_dataset.py       # Synthetic data generator
│   │   └── pune_properties.csv       # 2000+ row training dataset
│   ├── model/
│   │   ├── train_model.py            # XGBoost training pipeline
│   │   ├── xgb_pipeline.joblib       # Serialized trained model (2.1 MB)
│   │   ├── model_meta.json           # Corridors & localities metadata
│   │   └── metrics.json              # Training & evaluation metrics
│   ├── database.py                   # MongoDB connection module (graceful degradation)
│   ├── main.py                       # FastAPI app with all endpoints
│   ├── requirements.txt              # All Python dependencies
│   └── .env                          # Local env vars (gitignored — never committed)
│
├── frontend/                         # React + Vite frontend
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx            # App header with branding
│   │   │   ├── Footer.jsx            # Footer with GitHub CTA
│   │   │   ├── Dashboard.jsx         # Market charts component
│   │   │   ├── PredictionForm.jsx    # Property input form
│   │   │   ├── PredictionResult.jsx  # Result display card
│   │   │   └── PropertyTour3D.jsx    # Canvas 2D isometric animation
│   │   ├── pages/
│   │   │   ├── PredictPage.jsx       # Main valuation page
│   │   │   ├── MapPage.jsx           # Interactive map with corridors
│   │   │   ├── AestheticsPage.jsx    # 3D viz + property gallery
│   │   │   ├── ComparePage.jsx       # Corridor comparison tool
│   │   │   ├── HistoryPage.jsx       # MongoDB prediction history
│   │   │   └── AdminPage.jsx         # Model retraining dashboard
│   │   ├── api.js                    # Centralized API service layer
│   │   ├── App.jsx                   # Root with routing & navigation
│   │   ├── index.css                 # Design system (Tailwind + custom tokens)
│   │   └── main.jsx                  # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── assets/                           # README images
├── sample_data.csv                   # CSV template for model retraining
├── .gitignore
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB Atlas account (free M0 cluster)

### 1. Clone

```bash
git clone https://github.com/ranvirdeshmukh/AI-Powered-Property-Price-Predictor.git
cd AI-Powered-Property-Price-Predictor
```

### 2. Backend

```bash
# Install dependencies
pip install -r backend/requirements.txt

# Configure MongoDB (edit this file with your Atlas URI)
# backend/.env → MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0

# Start API server
cd backend
python3 -m uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000` | Swagger UI: `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173` (or next available port)

---

## 🌐 Cloud Deployment

### Backend → Render

| Field | Value |
|-------|-------|
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Environment Var | `MONGODB_URI` = your Atlas URI |

### Frontend → Vercel

| Field | Value |
|-------|-------|
| Root Directory | `frontend` |
| Framework | Vite (auto-detected) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment Var | `VITE_API_BASE_URL` = `https://your-render-url.onrender.com/api` |

---

## 🔒 Security & Design Decisions

| Decision | Rationale |
|----------|-----------|
| `.env` is gitignored | MongoDB credentials never enter version control |
| MongoDB write is fire-and-forget | A DB failure never blocks or delays the prediction response |
| Safe fallback retraining | Staging environment used before live swap — guarantees zero downtime |
| CORS `allow_origins=["*"]` | Permissive for demo; should be locked to Vercel domain in production |
| XGBoost serialized with joblib | Committed to repo so Render doesn't need to retrain on every deploy |

---

## 📄 License

This project is submitted as part of a technical hiring assessment. All rights reserved.

---

<p align="center">
  <strong>Pune EstateLens</strong> — Production-Grade AI Property Intelligence<br/>
  <a href="https://ai-powered-property-price-predictor.vercel.app">Live App</a> • 
  <a href="https://estatelens-backend.onrender.com/docs">API Docs</a> • 
  <a href="https://github.com/ranvirdeshmukh/AI-Powered-Property-Price-Predictor">Source Code</a>
</p>
