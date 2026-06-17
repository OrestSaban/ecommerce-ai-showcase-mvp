/**
 * API client for the FastAPI backend.
 * All dashboard endpoints in one place.
 */
const API_BASE = 'http://127.0.0.1:8000';

async function fetchJSON(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export function fetchKPIs(range = 'last_30_days') {
  return fetchJSON(`/api/dashboard/kpis?range=${range}`);
}

export function fetchSalesOverTime(range = 'last_30_days') {
  return fetchJSON(`/api/dashboard/sales-over-time?range=${range}`);
}

export function fetchSalesByCategory(range = 'last_30_days') {
  return fetchJSON(`/api/dashboard/sales-by-category?range=${range}`);
}

export function fetchTopPriority() {
  return fetchJSON('/api/dashboard/top-priority');
}

export function fetchBusinessHealth() {
  return fetchJSON('/api/dashboard/business-health');
}

export function fetchHealth() {
  return fetchJSON('/health');
}

// --- Warnings API ---

export function getWarnings() {
  return fetchJSON('/api/warnings');
}

export function getWarningById(warningId) {
  return fetchJSON(`/api/warnings/${warningId}`);
}

export function getWarningDeepReview(warningId) {
  return fetchJSON(`/api/warnings/${warningId}/deep-review`);
}
