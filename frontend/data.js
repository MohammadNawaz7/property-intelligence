/* ── THEME VARIABLES ────────────────────────────────────────────────── */
:root {
  --primary: #1e293b;       /* Slate 800 - Deep, authoritative */
  --accent: #f59e0b;        /* Amber 500 - Forecast/Action */
  --success: #10b981;       /* Emerald 500 */
  --danger: #ef4444;        /* Rose 500 */
  --bg-main: #f8fafc;       /* Slate 50 - Soft background */
  --bg-card: #ffffff;
  --border: #e2e8f0;        /* Slate 200 */
  --text-main: #0f172a;     /* Slate 900 */
  --text-muted: #64748b;    /* Slate 500 */
  --radius: 12px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
}

/* ── BASE STYLES ────────────────────────────────────────────────────── */
body {
  font-family: 'Inter', -apple-system, sans-serif;
  background-color: var(--bg-main);
  color: var(--text-main);
  line-height: 1.5;
  margin: 0;
}

/* ── ADVANCED METRIC CARDS ─────────────────────────────────────────── */
#mrow {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: var(--bg-card);
  padding: 1.5rem;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.mv {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--primary);
  margin: 0.25rem 0;
}

.ml {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: var(--text-muted);
  font-weight: 600;
}

/* ── STATUS TAGS (Dynamic colors) ─────────────────────────────────── */
.md-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.md-tag.up { background: #ecfdf5; color: #065f46; }
.md-tag.dn { background: #fef2f2; color: #991b1b; }
.md-tag.neutral { background: #f1f5f9; color: #475569; }
.md-tag.warning { background: #fffbeb; color: #92400e; }

/* ── SKELETON LOADERS (The "AI Thinking" State) ───────────────────── */
.skeleton-loader {
  padding: 1rem;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 10px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── SCENARIO ENGINE GLASSMORPHISM ───────────────────────────────── */
#t-scen {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 2rem;
  border-radius: 20px;
}

/* ── BUTTONS & INTERACTION ────────────────────────────────────────── */
button {
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

#wifbtn:not(:disabled) {
  background: var(--primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 4px 14px 0 rgba(30, 41, 59, 0.39);
}

#wifbtn:hover:not(:disabled) {
  transform: scale(1.02);
  filter: brightness(1.1);
}

#wifbtn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
