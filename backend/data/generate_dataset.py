"""
Pune EstateLens — Synthetic Dataset Generator
==============================================
Generates ~2,000 realistic residential property records for two Pune growth corridors
based on actual market research data (2024-2026 price ranges).

Corridors:
  1. Dehu Road → Solapur Road  (West-to-Southeast traverse)
  2. Kolhapur Road → Nashik Road (South-to-North traverse)
"""

import os
import numpy as np
import pandas as pd

np.random.seed(42)

# ──────────────────────────────────────────────────────────
# Locality Profiles — calibrated from real market research
# ──────────────────────────────────────────────────────────

LOCALITY_PROFILES = {
    # ── Corridor 1: Dehu Road → Solapur Road ──
    "dehu_solapur": {
        "Dehu Road":       {"base_rate": 5200,  "std": 600,  "premium_factor": 1.00},
        "Kiwale":          {"base_rate": 5800,  "std": 500,  "premium_factor": 1.03},
        "Ravet":           {"base_rate": 6500,  "std": 700,  "premium_factor": 1.06},
        "Wakad":           {"base_rate": 8200,  "std": 800,  "premium_factor": 1.15},
        "Baner":           {"base_rate": 9000,  "std": 900,  "premium_factor": 1.20},
        "Hadapsar":        {"base_rate": 7500,  "std": 750,  "premium_factor": 1.10},
        "Manjri":          {"base_rate": 6200,  "std": 600,  "premium_factor": 1.04},
        "Loni Kalbhor":    {"base_rate": 5000,  "std": 500,  "premium_factor": 1.00},
        "Uruli Kanchan":   {"base_rate": 4600,  "std": 450,  "premium_factor": 0.97},
    },
    # ── Corridor 2: Kolhapur Road → Nashik Road ──
    "kolhapur_nashik": {
        "Khed Shivapur":   {"base_rate": 5500,  "std": 550,  "premium_factor": 1.02},
        "Sinhagad Road":   {"base_rate": 7800,  "std": 800,  "premium_factor": 1.12},
        "Hinjewadi":       {"base_rate": 8500,  "std": 850,  "premium_factor": 1.18},
        "Balewadi":        {"base_rate": 9500,  "std": 900,  "premium_factor": 1.22},
        "Chakan":          {"base_rate": 5000,  "std": 500,  "premium_factor": 1.00},
        "Bhosari":         {"base_rate": 6000,  "std": 600,  "premium_factor": 1.05},
        "Moshi":           {"base_rate": 5400,  "std": 520,  "premium_factor": 1.01},
        "Alandi":          {"base_rate": 5100,  "std": 480,  "premium_factor": 0.99},
    },
}

BHK_SQFT_MAP = {
    1: {"mean": 550,  "std": 80,  "min": 380,  "max": 750},
    2: {"mean": 950,  "std": 120, "min": 700,  "max": 1300},
    3: {"mean": 1400, "std": 180, "min": 1100, "max": 1900},
    4: {"mean": 2100, "std": 250, "min": 1700, "max": 3000},
}

BHK_BATHROOM_MAP = {
    1: [1],
    2: [1, 2],
    3: [2, 2, 3],
    4: [3, 3, 4],
}

AMENITIES = ["parking", "gym", "swimming_pool", "garden", "security", "clubhouse"]

# Amenity premiums (% increase per amenity)
AMENITY_PREMIUMS = {
    "parking":       0.025,
    "gym":           0.018,
    "swimming_pool": 0.030,
    "garden":        0.015,
    "security":      0.020,
    "clubhouse":     0.022,
}


def generate_records(n_records: int = 2000) -> pd.DataFrame:
    """Generate n_records of synthetic property data."""
    records = []

    corridors = list(LOCALITY_PROFILES.keys())
    corridor_weights = [0.52, 0.48]  # slightly more for corridor 1

    for _ in range(n_records):
        # Pick corridor and locality
        corridor = np.random.choice(corridors, p=corridor_weights)
        localities = list(LOCALITY_PROFILES[corridor].keys())
        locality = np.random.choice(localities)
        profile = LOCALITY_PROFILES[corridor][locality]

        # BHK distribution: 1(15%), 2(40%), 3(35%), 4(10%)
        bhk = np.random.choice([1, 2, 3, 4], p=[0.15, 0.40, 0.35, 0.10])

        # Square footage (correlated with BHK)
        sqft_params = BHK_SQFT_MAP[bhk]
        sqft = int(np.clip(
            np.random.normal(sqft_params["mean"], sqft_params["std"]),
            sqft_params["min"],
            sqft_params["max"]
        ))

        # Bathrooms (correlated with BHK)
        bathrooms = int(np.random.choice(BHK_BATHROOM_MAP[bhk]))

        # Floor level (0 = ground, max varies by locality premium)
        max_floor = int(8 + profile["premium_factor"] * 15)
        floor = int(np.random.choice(range(0, max_floor + 1)))

        # Amenities (higher premium localities have more amenity probability)
        amenity_prob = 0.3 + profile["premium_factor"] * 0.25
        amenity_values = {}
        for amenity in AMENITIES:
            amenity_values[amenity] = int(np.random.random() < min(amenity_prob, 0.85))

        amenities_score = sum(amenity_values.values())

        # ──── Price Calculation ────
        # Base rate per sqft
        rate = np.random.normal(profile["base_rate"], profile["std"])
        rate = max(rate, profile["base_rate"] * 0.7)  # floor at 70% of base

        # Floor premium: +0.4% per floor above ground, diminishing after 15
        floor_multiplier = 1 + 0.004 * min(floor, 15) + 0.001 * max(0, floor - 15)

        # Amenity premium
        amenity_multiplier = 1.0
        for amenity, has_it in amenity_values.items():
            if has_it:
                amenity_multiplier += AMENITY_PREMIUMS[amenity]

        # BHK-size efficiency discount (larger units slightly lower per-sqft)
        size_factor = 1.0 - (bhk - 1) * 0.015

        # Bathroom premium
        bath_premium = 1.0 + (bathrooms - 1) * 0.01

        # Final price
        effective_rate = rate * floor_multiplier * amenity_multiplier * size_factor * bath_premium
        price = (effective_rate * sqft) / 100000  # Convert to Lakhs

        # Add realistic noise (±5%)
        noise = np.random.normal(1.0, 0.05)
        price = round(price * noise, 2)
        price = max(price, 10.0)  # minimum 10 lakhs

        record = {
            "corridor": corridor,
            "locality": locality,
            "bhk": bhk,
            "sqft": sqft,
            "bathrooms": bathrooms,
            "floor": floor,
            "parking": amenity_values["parking"],
            "gym": amenity_values["gym"],
            "swimming_pool": amenity_values["swimming_pool"],
            "garden": amenity_values["garden"],
            "security": amenity_values["security"],
            "clubhouse": amenity_values["clubhouse"],
            "amenities_score": amenities_score,
            "price_lakhs": price,
        }
        records.append(record)

    df = pd.DataFrame(records)
    return df


if __name__ == "__main__":
    print("🏗️  Generating Pune EstateLens synthetic dataset...")
    df = generate_records(2000)

    output_path = os.path.join(os.path.dirname(__file__), "pune_properties.csv")
    df.to_csv(output_path, index=False)

    print(f"✅  Dataset saved to {output_path}")
    print(f"   Records: {len(df)}")
    print(f"   Corridors: {df['corridor'].value_counts().to_dict()}")
    print(f"   Price range: ₹{df['price_lakhs'].min():.1f}L – ₹{df['price_lakhs'].max():.1f}L")
    print(f"\n📊 Sample:\n{df.head()}")
