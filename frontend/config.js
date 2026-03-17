// ── CONFIG — edit this one file to switch environments ───────────────
// Development: API runs locally at localhost:8000
// Production:  Replace with your Railway URL after deploying
//              e.g. "https://property-intelligence-api.up.railway.app"

const CONFIG = {
  // Change this to your Railway URL after deploying
  API_BASE: window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000"
    : "https://property-intelligence-production.up.railway.app",  // ← UPDATE THIS after Railway deploy

  // Feature flags
  USE_LIVE_LAND_REGISTRY: true,   // set false to use illustrative data only
  USE_LIVE_ONS: true,
  CACHE_RESULTS: true,
};

// Make available globally
window.CONFIG = CONFIG;
