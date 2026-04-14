/**
 * Pune EstateLens — API Service Layer
 * Handles all communication with the FastAPI backend.
 */

const API_BASE = 'http://localhost:8000/api';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.detail || `Request failed with status ${response.status}`,
        response.status
      );
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Unable to connect to the prediction server. Please ensure the backend is running.', 0);
  }
}

/** Health check */
export async function checkHealth() {
  return request('/health');
}

/** Fetch model metadata (corridors, localities) */
export async function fetchMeta() {
  return request('/meta');
}

/** Get a single price prediction */
export async function predictPrice(propertyData) {
  return request('/predict', {
    method: 'POST',
    body: JSON.stringify(propertyData),
  });
}

/** Compare price across both corridors */
export async function compareCorridors(propertyData) {
  return request('/compare', {
    method: 'POST',
    body: JSON.stringify(propertyData),
  });
}

/** Fetch aggregate statistics */
export async function fetchStats() {
  return request('/stats');
}

/** Fetch amenity impact data */
export async function fetchAmenityImpact() {
  return request('/amenity-impact');
}
