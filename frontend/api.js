// ── REFINED API SERVICE ───────────────────────────────────────────────────────
// Enhanced with caching and request tracking for a smoother UI experience.

const API = {
  // Simple in-memory cache to prevent redundant fetches when switching tabs
  _cache: new Map(),
  
  // Track active requests to show global loading spinners if needed
  _activeRequests: 0,

  async _request(url, options = {}) {
    this._activeRequests++;
    try {
      const resp = await fetch(url, options);
      if (!resp.ok) throw new Error(`Status ${resp.status}`);
      return await resp.json();
    } finally {
      this._activeRequests--;
    }
  },

  async fetchProperty(postcode) {
    const cacheKey = `prop_${postcode}`;
    if (this._cache.has(cacheKey)) return this._cache.get(cacheKey);

    try {
      const data = await this._request(`${CONFIG.API_BASE}/api/property?postcode=${encodeURIComponent(postcode)}`);
      this._cache.set(cacheKey, data);
      return data;
    } catch (e) {
      console.warn("Land Registry fetch failed:", e.message);
      return null;
    }
  },

  async fetchHPI(region) {
    const cacheKey = `hpi_${region}`;
    if (this._cache.has(cacheKey)) return this._cache.get(cacheKey);

    try {
      const data = await this._request(`${CONFIG.API_BASE}/api/hpi?region=${encodeURIComponent(region)}`);
      this._cache.set(cacheKey, data);
      return data;
    } catch (e) {
      console.warn("ONS HPI fetch failed:", e.message);
      return null;
    }
  },

  async fetchBaseRate() {
    // Base rates change rarely; cache for the duration of the session
    if (this._cache.has('base_rate')) return this._cache.get('base_rate');

    try {
      const data = await this._request(`${CONFIG.API_BASE}/api/base-rate`);
      this._cache.set('base_rate', data);
      return data;
    } catch (e) {
      console.warn("BoE rate fetch failed:", e.message);
      return { current_rate: 5.25 };
    }
  },

  async aiWhatIf(prompt) {
    // AI results are heavy; we use POST so we don't typically cache these 
    // unless you want to save tokens for identical prompts.
    try {
      const data = await this._request(`${CONFIG.API_BASE}/api/ai/whatif`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, max_tokens: 900 })
      });
      return data.result || "Unable to generate analysis.";
    } catch (e) {
      console.error("AI what-if failed:", e.message);
      return "AI service unavailable. Please try again.";
    }
  },

  async aiAreaAgent(criteria) {
    try {
      return await this._request(`${CONFIG.API_BASE}/api/ai/area-agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(criteria)
      });
    } catch (e) {
      console.error("Area agent failed:", e.message);
      return null;
    }
  },

  async fetchPlanning(postcode) {
    try {
      return await this._request(`${CONFIG.API_BASE}/api/planning?postcode=${encodeURIComponent(postcode)}`);
    } catch (e) {
      console.warn("Planning fetch failed:", e.message);
      return null;
    }
  }
};

window.API = API;
