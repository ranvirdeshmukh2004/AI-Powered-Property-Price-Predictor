"""
Pune EstateLens — MongoDB Connection Module
=============================================
Isolated database logic with graceful degradation.
If MongoDB is unreachable, the application continues to function normally
— predictions are served, just not persisted.

Environment:
  MONGODB_URI  — MongoDB Atlas connection string (from .env)
"""

import os
import logging
from datetime import datetime, timezone

from dotenv import load_dotenv

# Load .env from the backend directory
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

logger = logging.getLogger("estatelens.db")

# ──────────────────────────────────────────────────────────
# Connection state
# ──────────────────────────────────────────────────────────

_client = None
_db = None

MONGODB_URI = os.getenv("MONGODB_URI", "")
DB_NAME = "property_db"
COLLECTION_NAME = "predictions"


def connect():
    """Establish the MongoDB connection. Call once at startup."""
    global _client, _db

    if not MONGODB_URI:
        logger.warning("⚠️  MONGODB_URI not set — prediction logging disabled.")
        return False

    try:
        from pymongo import MongoClient
        import certifi
        import ssl

        # Build a clean URI with TLS params embedded
        clean_uri = MONGODB_URI
        if "tlsAllowInvalidCertificates" not in clean_uri:
            sep = "&" if "?" in clean_uri else "?"
            clean_uri = clean_uri + sep + "tlsAllowInvalidCertificates=false"

        try:
            # First try: strict TLS with certifi CA bundle (works locally and on most clouds)
            _client = MongoClient(
                clean_uri,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                tls=True,
                tlsCAFile=certifi.where(),
            )
            _client.admin.command("ping")
        except Exception:
            # Second try: relax cert verification for platforms with broken TLS chains
            logger.warning("⚠️  Strict TLS failed, retrying with relaxed cert validation...")
            _client = MongoClient(
                MONGODB_URI,
                serverSelectionTimeoutMS=8000,
                connectTimeoutMS=8000,
                tls=True,
                tlsAllowInvalidCertificates=True,
            )
            _client.admin.command("ping")

        _db = _client[DB_NAME]
        logger.info(f"✅ MongoDB connected — database: {DB_NAME}")
        return True

    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")
        _client = None
        _db = None
        return False


def disconnect():
    """Close the MongoDB connection. Call at shutdown."""
    global _client, _db
    if _client:
        _client.close()
        logger.info("🛑 MongoDB connection closed.")
    _client = None
    _db = None


def get_predictions_collection():
    """Return the predictions collection, or None if not connected."""
    if _db is None:
        return None
    return _db[COLLECTION_NAME]


def is_connected() -> bool:
    """Quick check if MongoDB is reachable."""
    if _client is None:
        return False
    try:
        _client.admin.command("ping")
        return True
    except Exception:
        return False


# ──────────────────────────────────────────────────────────
# Write helpers
# ──────────────────────────────────────────────────────────

def log_prediction(input_data: dict, prediction_data: dict) -> bool:
    """
    Store a prediction record in MongoDB.
    Returns True on success, False on failure (never raises).
    """
    collection = get_predictions_collection()
    if collection is None:
        return False

    try:
        record = {
            # Input fields
            "corridor": input_data.get("corridor"),
            "locality": input_data.get("locality"),
            "bhk": input_data.get("bhk"),
            "sqft": input_data.get("sqft"),
            "bathrooms": input_data.get("bathrooms"),
            "floor": input_data.get("floor"),
            "parking": input_data.get("parking", 0),
            "gym": input_data.get("gym", 0),
            "swimming_pool": input_data.get("swimming_pool", 0),
            "garden": input_data.get("garden", 0),
            "security": input_data.get("security", 0),
            "clubhouse": input_data.get("clubhouse", 0),
            "amenities_score": input_data.get("amenities_score", 0),
            # Prediction fields
            "predicted_price_lakhs": prediction_data.get("predicted_price_lakhs"),
            "price_per_sqft": prediction_data.get("price_per_sqft"),
            "confidence_low": prediction_data.get("confidence_low"),
            "confidence_high": prediction_data.get("confidence_high"),
            # Metadata
            "timestamp": datetime.now(timezone.utc),
        }
        collection.insert_one(record)
        logger.info(f"📝 Prediction logged: ₹{record['predicted_price_lakhs']}L for {record['locality']}")
        return True

    except Exception as e:
        logger.error(f"❌ Failed to log prediction: {e}")
        return False


# ──────────────────────────────────────────────────────────
# Read helpers
# ──────────────────────────────────────────────────────────

def get_recent_predictions(limit: int = 50) -> list:
    """Fetch the most recent predictions, newest first."""
    collection = get_predictions_collection()
    if collection is None:
        return []

    try:
        cursor = collection.find(
            {},
            {"_id": 0}  # exclude Mongo's internal _id
        ).sort("timestamp", -1).limit(limit)
        return list(cursor)
    except Exception as e:
        logger.error(f"❌ Failed to fetch history: {e}")
        return []


def get_corridor_stats() -> list:
    """Aggregate prediction stats by corridor."""
    collection = get_predictions_collection()
    if collection is None:
        return []

    try:
        pipeline = [
            {
                "$group": {
                    "_id": "$corridor",
                    "count": {"$sum": 1},
                    "avg_predicted_price": {"$avg": "$predicted_price_lakhs"},
                    "avg_sqft": {"$avg": "$sqft"},
                    "avg_price_per_sqft": {"$avg": "$price_per_sqft"},
                    "min_price": {"$min": "$predicted_price_lakhs"},
                    "max_price": {"$max": "$predicted_price_lakhs"},
                }
            },
            {"$sort": {"_id": 1}},
        ]
        results = list(collection.aggregate(pipeline))
        # Rename _id → corridor for cleaner API
        for r in results:
            r["corridor"] = r.pop("_id")
            for key in ["avg_predicted_price", "avg_sqft", "avg_price_per_sqft", "min_price", "max_price"]:
                if r.get(key) is not None:
                    r[key] = round(r[key], 2)
        return results
    except Exception as e:
        logger.error(f"❌ Failed to aggregate corridor stats: {e}")
        return []
