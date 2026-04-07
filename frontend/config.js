// ── CONFIG — REFINED FOR PRODUCTION & SCALE ─────────────────────────────
// This file manages environment-specific logic and feature toggles.

const CONFIG = {
  // 1. Environment & API Routing
  VERSION: "3.1.2", // Track versioning to manage cache clearing or migrations
  API_BASE: window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000"
    : "https://property-intelligence-production.up.railway.app",

  // 2. Performance & Connectivity
  TIMEOUT_MS: 10000, // Global timeout for API calls (10 seconds)
  CACHE_RESULTS: true, // Tied to the _cache logic in our API service
  
  // 3. Feature Flags (Control UI visibility without re-deploying)
  FEATURES: {
    LIVE_LAND_REGISTRY: true,
    LIVE_ONS: true,
    AI_SIMULATION: true,  // Toggle the Scenario Engine if API costs get high
    PLANNING_TRACKER: true,
    PRO_BADGE_VISIBLE: true // Control the visibility of the "PRO VERSION" tag
  },

  // 4. UI Constants (Professional Design Sync)
  THEME: {
    PRIMARY_COLOR: "#1D4ED8", // Deep Navy
    ACCENT_COLOR: "#EF9F27",  // Forecast Orange
    ERROR_COLOR: "#E24B4A",   // Risk Red
    ANIMATION_SPEED: 300      // Syncs with our CSS transitions (ms)
  }
};

// Freeze the object to prevent accidental changes during runtime
Object.freeze(CONFIG);

// Make available globally
window.CONFIG = CONFIG;
