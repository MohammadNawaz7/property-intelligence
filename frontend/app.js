// ── APP.JS — REFINED LOGIC ──────────────────────────────────
let cx = null, prop = null, CH = {};
const lv = {}; LEVERS.forEach(l => lv[l.id] = l.def);

// ── UTILS ────────────────────────────────────────────────────────────
const gr = r => ({'London':.062,'Wales':.048,'South West':.055,'North West':.044})[r] || .048;
const scAdj = () => LEV_IDS.reduce((s,id,i) => s + (lv[id]||0)/LEV_UNITS[i]*BASE_EFF[i], 0);

// Smooth Chart Destruction with Fade-out if needed
const killCharts = () => { 
    Object.values(CH).forEach(c => c && c.destroy && c.destroy()); 
    Object.keys(CH).forEach(k => delete CH[k]); 
};

// Advanced Tab Switching with Animation Hooks
function sw(t) {
  const ord = ['hist','polc','scen','nbhd','pmap','aagt','bnch'];
  document.querySelectorAll('.tab').forEach((b,i) => {
    const isActive = ord[i] === t;
    b.classList.toggle('on', isActive);
    // Add accessibility hint
    b.setAttribute('aria-selected', isActive);
  });
  
  document.querySelectorAll('.pnl').forEach(p => {
    const isActive = p.id === 't-' + t;
    p.classList.toggle('on', isActive);
    if (isActive) p.style.animation = 'fadeIn 0.4s ease-out';
  });
}

// ── PROPERTY SEARCH & INITIALIZATION ─────────────────────────────────
function doSearch() {
  const v = document.getElementById('ain').value.trim(); 
  if (!v) return;
  
  // Show a "Searching" state in the input
  const input = document.getElementById('ain');
  input.classList.add('loading-state');

  const k = Object.keys(PROPS).find(k => 
    PROPS[k].addr.toLowerCase().includes(v.toLowerCase().split(' ')[0])
  ) || 'cf';
  
  setTimeout(() => {
    input.classList.remove('loading-state');
    go(k, null);
  }, 300);
}

function go(key, el) {
  // UI Feedback for selection
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('on'));
  if (el) el.classList.add('on');

  cx = key; 
  prop = PROPS[key];
  
  // Visual Transition: Fade out old data
  const mainContent = document.getElementById('main-content-area');
  if(mainContent) mainContent.style.opacity = '0';

  setTimeout(() => {
    document.getElementById('ain').value = prop.addr;
    document.getElementById('abtxt').textContent = prop.addr;
    
    killCharts(); 
    showPropUI(true);
    
    // Batch UI updates
    renderDashboard();
    
    if(mainContent) mainContent.style.opacity = '1';
    sw('hist');
  }, 100);
}

// ── COMPONENT RENDERING (Refined for "Advanced" Look) ────────────────
function renderDashboard() {
  buildPropBar(); 
  buildMetrics(); 
  buildPolicyToggles();
  buildMainChart(); 
  buildHistoryTable(); 
  buildCAGR();
  buildPolicyChart(); 
  buildPolicyTimeline();
  buildNeighbourhood(); 
  buildPlanningTracker();
  buildPolicyMap(); 
  updateAALeverSummary();
  buildBench(); 
  buildReturn(); 
  buildCosts();
}

function buildMetrics() {
  const p = prop, f = p.tx[0], g = Math.round(((p.cur-f.p)/f.p)*100);
  const l = p.tx[p.tx.length-1], r = Math.round(((p.cur-l.p)/l.p)*100);
  
  // Using modern template literals with refined HTML structure
  document.getElementById('mrow').innerHTML = `
    <div class="metric-card">
        <span class="ml">Estimated Value</span>
        <div class="mv">£${(p.cur/1000).toFixed(0)}k</div>
        <div class="md-tag neutral">2024 Market Est.</div>
    </div>
    <div class="metric-card">
        <span class="ml">Capital Growth</span>
        <div class="mv">+${g}%</div>
        <div class="md-tag up">▲ £${((p.cur-f.p)/1000).toFixed(0)}k <small>since ${f.yr}</small></div>
    </div>
    <div class="metric-card">
        <span class="ml">Yield vs Last Sale</span>
        <div class="mv">${r>0?'+':''}${r}%</div>
        <div class="md-tag ${r>0?'up':'dn'}">${r>0?'▲':'▼'} vs ${l.yr}</div>
    </div>
    <div class="metric-card">
        <span class="ml">Affordability Ratio</span>
        <div class="mv">${p.aff}×</div>
        <div class="md-tag ${p.aff>8?'warning':'safe'}">${p.aff > 8 ? 'High Multiple' : 'Standard'}</div>
    </div>`;
}

// ── SCENARIO ENGINE (AI REFINEMENT) ──────────────────────────────────
async function aiWhatIf() {
  const p = prop; if (!p) return;
  const btn = document.getElementById('wifbtn');
  const out = document.getElementById('wiout');
  
  // Advanced Loading State
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-small"></span> Analysing Scenario...`;
  out.innerHTML = `
    <div class="skeleton-loader">
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line" style="width:60%"></div>
    </div>`;

  const adj = scAdj(), base = gr(p.region);
  const v29 = Math.round(p.cur * Math.pow(1 + (base + adj), 5));
  const ls = LEVERS.filter(l => lv[l.id] !== 0).map(l => `${l.lbl}: ${lv[l.id]}${l.unit}`).join('\n') || 'Baseline';
  
  const prompt = `System: Housing Economist. Analyze ${p.addr}. Value: £${p.cur}. Forecast: £${v29}. Levers: ${ls}. Focus on ${p.region} specific risks.`;
  
  const result = await API.aiWhatIf(prompt);
  
  // Typographic refinement: Render AI result with better line-height
  out.innerHTML = `<div class="ai-response-text">${result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>`;
  
  btn.disabled = false;
  btn.innerHTML = `Run AI Simulation`;
}

// ── INITIALIZATION ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    buildSliders();
    buildPolicyMap();
    updateAALeverSummary();
    
    // Auto-load first property with a slight delay for "wow" factor
    setTimeout(() => {
        const firstPill = document.querySelector('.pill');
        if (firstPill) go('cf', firstPill);
    }, 500);
});
