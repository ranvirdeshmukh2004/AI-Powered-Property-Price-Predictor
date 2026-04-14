# 🏙️ Pune EstateLens — AI-Powered Property Price Predictor

<p align="center">
  <strong>Intelligent Property Valuations for Pune's Growth Corridors</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/XGBoost-2.1-blue" alt="XGBoost" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Python-3.9+-3776AB?logo=python" alt="Python" />
</p>

---

## 📋 Overview

**Pune EstateLens** is a full-stack AI-powered web application that provides real-time residential property valuations across Pune's two fastest-growing corridors. Every prediction is logged to MongoDB Atlas for historical analytics and corridor comparison.

| Corridor | Direction | Key Localities |
|----------|-----------|---------------|
| **Dehu Road → Solapur Road** | West → Southeast | Dehu Road, Kiwale, Ravet, Wakad, Baner, Hadapsar, Manjri, Loni Kalbhor, Uruli Kanchan |
| **Kolhapur Road → Nashik Road** | South → North | Khed Shivapur, Sinhagad Road, Hinjewadi, Balewadi, Chakan, Bhosari, Moshi, Alandi |

### Key Features

- 🏠 **Predictive Engine** — Input property specs (BHK, sq.ft., bathrooms, floor, amenities) and get instant valuations in ₹ Lakhs
- 🔄 **Corridor Comparison** — "What If" feature shows how the same property would be priced in the alternate corridor
- 📊 **Market Dashboard** — Interactive charts visualizing price trends, BHK comparisons, and amenity impact analysis
- 🗺️ **Interactive Maps** — Leaflet-based corridor visualization with custom markers and route overlays
- 🎨 **3D Visualization** — Real-time isometric architectural animation built with pure Canvas 2D
- 📜 **Prediction History** — MongoDB-backed log of all predictions with scatter charts and corridor analytics
- 🔁 **Live Model Retraining** — Upload new CSV data to retrain the XGBoost model with safe-fallback mechanism
- 🎯 **Premium Dark UI** — Glassmorphism design with smooth animations and responsive layout

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------| 
| **Frontend** | React 19 + Vite 8 | Single-page application |
| **Styling** | Tailwind CSS v3 | Responsive, utility-first styling |
| **Charts** | Recharts | Interactive data visualizations |
| **Maps** | React Leaflet | Corridor & locality mapping |
| **Icons** | Lucide React | Consistent icon system |
| **Backend** | FastAPI (Python) | REST API serving predictions |
| **ML Model** | XGBoost + Scikit-learn | Regression model for price prediction |
| **Database** | MongoDB Atlas | Prediction history & analytics persistence |
| **Data** | Pandas + NumPy | Dataset generation and processing |

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- **Python** 3.9+
- **Node.js** 18+ (with npm)
- **MongoDB Atlas** account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/ranvirdeshmukh/AI-Powered-Property-Price-Predictor.git
cd AI-Powered-Property-Price-Predictor
```

### 2. Backend Setup

```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Generate the synthetic dataset (if not present)
cd backend/data
python generate_dataset.py

# Train the XGBoost model (if not present)
cd ../model
python train_model.py

# Configure MongoDB
cd ..
# Edit backend/.env and set your MONGODB_URI
# Example: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0

# Start the FastAPI server
python3 -m uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 3. Frontend Setup

```bash
# Install Node dependencies
cd frontend
npm install

# Start the dev server
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### 4. Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `MONGODB_URI` | `backend/.env` | MongoDB Atlas connection string |
| `VITE_API_BASE_URL` | Vercel env vars (production only) | Backend API URL for production |

---

## 🧠 Machine Learning Model

| Metric | Value |
|--------|-------|
| **Algorithm** | XGBoost Regression |
| **Features** | 13 (2 categorical + 11 numeric) |
| **Test R²** | ~0.91 |
| **Cross-Validation** | 5-fold |
| **Training Data** | 2,000+ synthetic records |

### Feature Set

| Category | Features |
|----------|----------|
| **Property** | BHK, Sqft, Bathrooms, Floor |
| **Location** | Corridor, Locality |
| **Amenities** | Parking, Gym, Swimming Pool, Garden, Security, Clubhouse |
| **Derived** | Amenities Score (sum of all amenity flags) |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check with MongoDB status |
| `GET` | `/api/meta` | Model metadata (corridors, localities) |
| `POST` | `/api/predict` | Single property valuation |
| `POST` | `/api/compare` | Side-by-side corridor comparison |
| `GET` | `/api/stats` | Aggregate market statistics |
| `GET` | `/api/amenity-impact` | Amenity price impact analysis |
| `GET` | `/api/history` | Recent predictions from MongoDB |
| `GET` | `/api/history/corridor-stats` | Corridor aggregation from history |
| `POST` | `/api/retrain` | Upload CSV to retrain model |

---

## 🌐 Deployment

### Backend → Render

| Setting | Value |
|---------|-------|
| **Root Directory** | `backend` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Environment Variable** | `MONGODB_URI` = your Atlas connection string |

### Frontend → Vercel

| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend` |
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Environment Variable** | `VITE_API_BASE_URL` = `https://your-render-app.onrender.com/api` |

---

## 📁 Project Structure

```
AI-Powered-Property-Price-Predictor/
├── backend/
│   ├── data/
│   │   ├── generate_dataset.py      # Synthetic data generator
│   │   └── pune_properties.csv      # Training dataset
│   ├── model/
│   │   ├── train_model.py           # XGBoost training pipeline
│   │   ├── xgb_pipeline.joblib      # Trained model artifact
│   │   ├── model_meta.json          # Corridors & localities metadata
│   │   └── metrics.json             # Model performance metrics
│   ├── database.py                  # MongoDB connection module
│   ├── main.py                      # FastAPI application
│   ├── requirements.txt             # Python dependencies
│   └── .env                         # Environment variables (gitignored)
├── frontend/
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   ├── pages/                   # Route-level page components
│   │   ├── api.js                   # API service layer
│   │   ├── App.jsx                  # Root app with routing
│   │   ├── index.css                # Design system & theme
│   │   └── main.jsx                 # Entry point
│   ├── package.json
│   └── vite.config.js
├── sample_data.csv                  # Template for model retraining
├── .gitignore
└── README.md
```

---

## 📄 License

This project is for educational and demonstration purposes.

---

<p align="center">
  <strong>Pune EstateLens</strong> — AI-Powered Property Intelligence
</p>
