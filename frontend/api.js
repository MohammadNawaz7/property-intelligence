// ── API SERVICE ───────────────────────────────────────────────────────
// All calls to the backend go through here.
// Handles errors, loading states, and caching consistently.

const API = {

  async fetchProperty(postcode) {
    try {
      const resp = await fetch(`${CONFIG.API_BASE}/api/property?postcode=${encodeURIComponent(postcode)}`);
      if (!resp.ok) throw new Error(`Status ${resp.status}`);
      return await resp.json();
    } catch (e) {
      console.warn("Land Registry fetch failed:", e.message);
      return null;
    }
  },

  async fetchHPI(region) {
    try {
      const resp = await fetch(`${CONFIG.API_BASE}/api/hpi?region=${encodeURIComponent(region)}`);
      if (!resp.ok) throw new Error(`Status ${resp.status}`);
      return await resp.json();
    } catch (e) {
      console.warn("ONS HPI fetch failed:", e.message);
      return null;
    }
  },

  async fetchBaseRate() {
    try {
      const resp = await fetch(`${CONFIG.API_BASE}/api/base-rate`);
      if (!resp.ok) throw new Error(`Status ${resp.status}`);
      return await resp.json();
    } catch (e) {
      console.warn("BoE rate fetch failed:", e.message);
      return { current_rate: 5.25 };
    }
  },

  async aiWhatIf(prompt) {
    try {
      const resp = await fetch(`${CONFIG.API_BASE}/api/ai/whatif`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, max_tokens: 900 })
      });
      if (!resp.ok) throw new Error(`Status ${resp.status}`);
      const data = await resp.json();
      return data.result || "Unable to generate analysis.";
    } catch (e) {
      console.error("AI what-if failed:", e.message);
      return "AI service unavailable. Please try again.";
    }
  },

  async aiAreaAgent(criteria) {
    try {
      const resp = await fetch(`${CONFIG.API_BASE}/api/ai/area-agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(criteria)
      });
      if (!resp.ok) throw new Error(`Status ${resp.status}`);
      const data = await resp.json();
      return data.result;
    } catch (e) {
      console.error("Area agent failed:", e.message);
      return null;
    }
  },

  async fetchPlanning(postcode) {
    try {
      const resp = await fetch(`${CONFIG.API_BASE}/api/planning?postcode=${encodeURIComponent(postcode)}`);
      if (!resp.ok) throw new Error(`Status ${resp.status}`);
      return await resp.json();
    } catch (e) {
      console.warn("Planning fetch failed:", e.message);
      return null;
    }
  }
};

window.API = API;
