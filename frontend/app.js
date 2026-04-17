app.js code // ── APP.JS — main application logic ──────────────────────────────────

let cx = null, prop = null, CH = {};

const lv = {}; LEVERS.forEach(l => lv[l.id] = l.def);



// ── UTILS ────────────────────────────────────────────────────────────

const gr = r => ({'London':.062,'Wales':.048,'South West':.055,'North West':.044})[r] || .048;

const scAdj = () => LEV_IDS.reduce((s,id,i) => s + (lv[id]||0)/LEV_UNITS[i]*BASE_EFF[i], 0);

const killCharts = () => { Object.values(CH).forEach(c => c && c.destroy && c.destroy()); Object.keys(CH).forEach(k => delete CH[k]); };



function sw(t) {

  const ord = ['hist','polc','scen','nbhd','pmap','aagt','bnch'];

  document.querySelectorAll('.tab').forEach((b,i) => b.classList.toggle('on', ord[i]===t));

  document.querySelectorAll('.pnl').forEach(p => p.classList.toggle('on', p.id==='t-'+t));

}



function showPropUI(show) {

  ['hist','polc','nbhd','bnch'].forEach(t => {

    const es = document.getElementById('es-'+t), ct = document.getElementById(t+'-c');

    if (es) es.classList.toggle('hidden', show);

    if (ct) ct.classList.toggle('hidden', !show);

  });

  if (show) {

    document.getElementById('abadge').classList.remove('hidden');

    document.getElementById('pbar').classList.remove('hidden');

    document.getElementById('mrow').classList.remove('hidden');

    document.getElementById('wifbtn').disabled = false;

    document.getElementById('polc-c') && document.getElementById('polc-c').classList.remove('hidden');

  }

}



function doSearch() {

  const v = document.getElementById('ain').value.trim(); if (!v) return;

  const k = Object.keys(PROPS).find(k => PROPS[k].addr.toLowerCase().includes(v.toLowerCase().split(' ')[0])) || 'cf';

  go(k, null);

}



function go(key, el) {

  document.querySelectorAll('.pill').forEach(p => p.classList.remove('on'));

  if (el) el.classList.add('on');

  cx = key; prop = PROPS[key];

  document.getElementById('ain').value = prop.addr;

  document.getElementById('abtxt').textContent = prop.addr;

  killCharts(); showPropUI(true);

  buildPropBar(); buildMetrics(); buildPolicyToggles();

  buildMainChart(); buildHistoryTable(); buildCAGR();

  buildPolicyChart(); buildPolicyTimeline();

  buildNeighbourhood(); buildPlanningTracker();

  buildPolicyMap(); updateAALeverSummary();

  buildBench(); buildReturn(); buildCosts();

  sw('hist');

}



// ── PROPERTY BAR & METRICS ────────────────────────────────────────────

function buildPropBar() {

  const p = prop;

  document.getElementById('pbar').innerHTML =

    ['Type','Beds','Floor area','Tenure','Council','Region']

    .map((l,i) => `<div class="pi"><div class="pil">${l}</div><div class="piv">${[p.type,p.beds+' bed',p.sqft.toLocaleString()+' sq ft',p.tenure,p.council,p.region][i]}</div></div>`)

    .join('<div class="vd"></div>');

}



function buildMetrics() {

  const p = prop, f = p.tx[0], g = Math.round(((p.cur-f.p)/f.p)*100), l = p.tx[p.tx.length-1], r = Math.round(((p.cur-l.p)/l.p)*100);

  document.getElementById('mrow').innerHTML = `

    <div class="metric"><div class="ml">Estimated value</div><div class="mv">£${(p.cur/1000).toFixed(0)}k</div><div class="md nt">2024 estimate</div></div>

    <div class="metric"><div class="ml">Growth since ${f.yr}</div><div class="mv">+${g}%</div><div class="md up">▲ £${((p.cur-f.p)/1000).toFixed(0)}k</div></div>

    <div class="metric"><div class="ml">Since last sale</div><div class="mv">${r>0?'+':''}${r}%</div><div class="md ${r>0?'up':'dn'}">vs ${l.yr}</div></div>

    <div class="metric"><div class="ml">Affordability</div><div class="mv">${p.aff}×</div><div class="md ${p.aff>8?'up':'nt'}">income multiple</div></div>`;

}



// ── HISTORY ────────────────────────────────────────────────────────────

function buildPolicyToggles() {

  const row = document.getElementById('ptrow'); row.innerHTML = '<span style="font-size:12px;color:var(--text2);margin-right:5px">Events:</span>';

  POL_EVTS.forEach(pl => {

    const lbl = document.createElement('label'); lbl.className = 'ptog';

    lbl.innerHTML = `<input type="checkbox" checked onchange="buildMainChart()"><span class="ptd" style="background:${pl.c}"></span>${pl.lbl}`;

    row.appendChild(lbl);

  });

}



function getVisPols() { const inp = document.querySelectorAll('.ptog input'); return POL_EVTS.filter((_,i) => inp[i]&&inp[i].checked); }



function buildMainChart() {

  if (!prop) return;

  const p = prop, base = gr(p.region), adj = scAdj(), rate = base + adj;

  const idx = ALLYR.map(y => { if(y>2024) return null; const tx=p.tx.filter(t=>t.yr<=y); if(!tx.length) return null; const l=tx[tx.length-1]; return Math.round(l.p*Math.pow(1+base,y-l.yr)); });

  const fcC = ALLYR.map(y => y<2024?null:Math.round(p.cur*Math.pow(1+rate,y-2024)));

  const fcH = ALLYR.map(y => y<2024?null:Math.round(p.cur*Math.pow(1+(rate+.025),y-2024)));

  const fcL = ALLYR.map(y => y<2024?null:Math.round(p.cur*Math.pow(1+(rate-.02),y-2024)));

  const vf = ALLYR.map(y => { const t=p.tx.find(t=>t.yr===y); return t?t.p:null; });

  if (CH.m) CH.m.destroy();

  CH.m = new Chart(document.getElementById('cm'), {

    type:'line', data:{labels:ALLYR,datasets:[

      {data:fcH,borderColor:'transparent',backgroundColor:'rgba(239,159,39,.12)',fill:'+1',pointRadius:0,tension:.4},

      {data:fcL,borderColor:'transparent',backgroundColor:'transparent',fill:false,pointRadius:0,tension:.4},

      {label:'Forecast',data:fcC,borderColor:'#EF9F27',borderWidth:2,borderDash:[6,4],backgroundColor:'transparent',pointRadius:3,pointBackgroundColor:'#EF9F27',tension:.4},

      {label:'Index',data:idx,borderColor:'#1D9E75',borderWidth:1.5,backgroundColor:'transparent',pointRadius:0,tension:.4,borderDash:[2,3]},

      {label:'Sale',data:vf,borderColor:'#378ADD',backgroundColor:'#378ADD',pointRadius:6,pointHoverRadius:9,showLine:false,type:'scatter'},

    ]},

    options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},

      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>{const v=c.raw;return v?c.dataset.label+': £'+Math.round(v/1000)+'k':null}}}},

      scales:{x:{grid:{color:'rgba(128,128,128,.05)'},ticks:{color:'#888',font:{size:10},maxTicksLimit:12}},

              y:{grid:{color:'rgba(128,128,128,.05)'},ticks:{color:'#888',font:{size:10},callback:v=>'£'+(v/1000).toFixed(0)+'k'}}}}

  });

}



function buildHistoryTable() {

  const p = prop, tb = document.getElementById('htb'); tb.innerHTML = '';

  p.tx.forEach((t,i) => {

    const prev = i>0?p.tx[i-1]:null, chg = prev?Math.round(((t.p-prev.p)/prev.p)*100):null;

    const cH = chg!==null ? `<span class="chg" style="background:${chg>=0?'#FCEBEB':'#EAF3DE'};color:${chg>=0?'#A32D2D':'#3B6D11'}">${chg>=0?'+':''}${chg}%</span>` : '<span style="color:var(--text2);font-size:12px">First record</span>';

    tb.innerHTML += `<tr><td>${t.yr}</td><td style="font-weight:500">£${t.p.toLocaleString()}</td><td>${cH}</td><td style="font-size:12px;color:var(--text2)">${t.ctx}</td></tr>`;

  });

  const l = p.tx[p.tx.length-1], c2 = Math.round(((p.cur-l.p)/l.p)*100);

  tb.innerHTML += `<tr style="background:var(--bg2)"><td>2024</td><td style="font-weight:500">£${p.cur.toLocaleString()}</td><td><span class="chg" style="background:#E6F1FB;color:#185FA5">Est. +${c2}%</span></td><td style="font-size:12px;color:var(--text2)">Index-adjusted estimate</td></tr>`;

}



function buildCAGR() {

  const p = prop, pts = [...p.tx,{yr:2024,p:p.cur}], lbls = [], vals = [];

  for (let i=1;i<pts.length;i++) { const a=pts[i-1],b=pts[i],y=b.yr-a.yr; lbls.push(`${a.yr}–${b.yr}`); vals.push(+((Math.pow(b.p/a.p,1/y)-1)*100).toFixed(1)); }

  if (CH.cg) CH.cg.destroy();

  CH.cg = new Chart(document.getElementById('ccg'), {type:'bar',data:{labels:lbls,datasets:[{data:vals,backgroundColor:vals.map(v=>v>=5?'#E24B4Abb':v>=2?'#EF9F27bb':'#1D9E75bb'),borderRadius:4,borderSkipped:false}]},

    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{color:'#888',font:{size:10}}},y:{grid:{color:'rgba(128,128,128,.06)'},ticks:{color:'#888',font:{size:10},callback:v=>v+'%'}}}}});

}



// ── POLICY ─────────────────────────────────────────────────────────────

function buildPolicyChart() {

  const p = prop; if (CH.pl) CH.pl.destroy();

  CH.pl = new Chart(document.getElementById('cpl'), {type:'bar',data:{labels:p.pi.map(x=>x.l),datasets:[{data:p.pi.map(x=>x.v),backgroundColor:p.pi.map(x=>x.v>0?x.c+'bb':'#88878077'),borderRadius:4,borderSkipped:false}]},

    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>{const v=c.raw;return(v>=0?'+£':'-£')+Math.abs(v).toLocaleString()+' est.'}}}},

      scales:{x:{grid:{display:false},ticks:{color:'#888',font:{size:10}}},y:{grid:{color:'rgba(128,128,128,.06)'},ticks:{color:'#888',font:{size:10},callback:v=>(v>=0?'+£':'-£')+Math.abs(v/1000).toFixed(0)+'k'}}}}});

  document.getElementById('polnote').textContent = prop.pnote;

}



function buildPolicyTimeline() {

  document.getElementById('ptl').innerHTML = POL_TL.map(e => `

    <div style="display:flex;gap:10px;padding:8px 0;border-bottom:.5px solid var(--border)">

      <span style="font-size:13px;font-weight:600;color:${e.c};min-width:36px">${e.yr}</span>

      <div><div style="font-size:13px;font-weight:500;margin-bottom:2px">${e.lbl}</div><div style="font-size:12px;color:var(--text2);line-height:1.5">${e.det}</div></div>

    </div>`).join('');

}



// ── SCENARIOS ──────────────────────────────────────────────────────────

function buildSliders() {

  const pc = document.getElementById('presets'); pc.innerHTML = '';

  Object.entries(PRESETS).forEach(([k,v]) => { const s=document.createElement('span');s.className='pre';s.textContent=v.lbl;s.onclick=()=>{document.querySelectorAll('.pre').forEach(p=>p.classList.remove('on'));s.classList.add('on');applyPreset(k);};pc.appendChild(s); });

  document.getElementById('sliders').innerHTML = LEVERS.map(l => `

    <div class="si">

      <div class="sih"><span class="sil">${l.lbl}</span><span class="siv" id="sv-${l.id}">${l.def}${l.unit}</span></div>

      <input type="range" min="${l.min}" max="${l.max}" value="${l.def}" step="${l.step}" id="sl-${l.id}" oninput="updLev('${l.id}',this.value,'${l.unit}')">

      <div class="sid">${l.desc}</div>

    </div>`).join('');

  updateForecastBox();

}



function applyPreset(k) {

  const v = PRESETS[k];

  LEVERS.forEach(l => { lv[l.id]=v[l.id]; const s=document.getElementById('sl-'+l.id); if(s) s.value=v[l.id]; const sp=document.getElementById('sv-'+l.id); if(sp) sp.textContent=v[l.id]+l.unit; });

  buildMainChart(); updateForecastBox(); buildPolicyMap(); updateAALeverSummary();

}



function updLev(id, val, unit) {

  lv[id] = parseFloat(val); const s=document.getElementById('sv-'+id); if(s) s.textContent=val+unit;

  document.querySelectorAll('.pre').forEach(p => p.classList.remove('on'));

  buildMainChart(); updateForecastBox(); buildPolicyMap(); updateAALeverSummary();

}



function updateForecastBox() {

  if (!prop) { document.getElementById('fbox').textContent='Select an address to see the forecast.'; return; }

  const p=prop,base=gr(p.region),adj=scAdj(),rate=base+adj;

  const v29=Math.round(p.cur*Math.pow(1+rate,5)),diff=v29-p.cur,pct=Math.round((diff/p.cur)*100);

  const v29h=Math.round(p.cur*Math.pow(1+rate+.025,5)),v29l=Math.round(p.cur*Math.pow(1+rate-.02,5));

  document.getElementById('fbox').innerHTML = `<strong>2029 central forecast: £${v29.toLocaleString()}</strong> — ${Math.abs(pct)}% ${diff>=0?'increase':'decrease'} (${diff>=0?'+':'-'}£${(Math.abs(diff)/1000).toFixed(0)}k).<br><span style="color:var(--text2)">Rate: ${(rate*100).toFixed(1)}%/yr. 80% range: £${(v29l/1000).toFixed(0)}k–£${(v29h/1000).toFixed(0)}k. LSE elasticity + BoE transmission methodology.</span>`;

}



async function aiWhatIf() {

  const p = prop; if (!p) return;

  const btn=document.getElementById('wifbtn'), out=document.getElementById('wiout');

  btn.disabled=true; out.innerHTML='<span class="spin"></span> Generating analysis...';

  const adj=scAdj(),base=gr(p.region),v29=Math.round(p.cur*Math.pow(1+(base+adj),5));

  const ls = LEVERS.filter(l=>lv[l.id]!==0).map(l=>`${l.lbl}: ${lv[l.id]}${l.unit}`).join('\n')||'Baseline — no levers active';

  const prompt = `You are a UK housing economist. Analyse this policy scenario.\n\nPROPERTY: ${p.addr} | Region: ${p.region} | Value: £${p.cur.toLocaleString()} | Affordability: ${p.aff}× earnings\n2029 model forecast: £${v29.toLocaleString()} (adj: ${(adj*100).toFixed(1)}%/yr)\n\nACTIVE LEVERS:\n${ls}\n\nWrite with EXACTLY these bold headers:\n\n**SCENARIO HEADLINE**\nOne sentence summary.\n\n**PRICE IMPACT BY 2029**\nSpecific estimate with reasoning.\n\n**WHO BENEFITS**\n2–3 groups.\n\n**WHO LOSES OUT**\n2–3 groups.\n\n**MAIN RISK**\nSingle biggest downside.\n\n**POLICY VERDICT**\nCoherent? What is contradictory?\n\n200 words max. Be specific to ${p.region}.`;

  const result = await API.aiWhatIf(prompt);

  out.textContent = result;

  btn.disabled = false;

}



// ── NEIGHBOURHOOD ──────────────────────────────────────────────────────

function buildNeighbourhood() {

  const devs = NB[cx];

  const pos=devs.filter(d=>d.dir==='pos').length, con=devs.filter(d=>d.sc==='s-con').length;

  const tot = devs.filter(d=>d.dir==='pos').reduce((a,d)=>a+(parseFloat(d.imp)||0),0);

  document.getElementById('nbst').innerHTML = `

    <div class="nbs"><div class="nbsv">${devs.length}</div><div class="nbsl">Tracked</div></div>

    <div class="nbs"><div class="nbsv" style="color:#1D9E75">${pos}</div><div class="nbsl">Value-positive</div></div>

    <div class="nbs"><div class="nbsv" style="color:#EF9F27">${con}</div><div class="nbsl">Under construction</div></div>

    <div class="nbs"><div class="nbsv">+${tot.toFixed(1)}%</div><div class="nbsl">Upside potential</div></div>`;

  const years = [...new Set(devs.map(d=>d.yr))].sort();

  const db = document.getElementById('devboard'); db.innerHTML='';

  years.forEach(yr => {

    db.innerHTML += `<div class="ylbl">${yr}</div>`;

    devs.filter(d=>d.yr===yr).forEach(d => {

      const dc = d.dir==='pos'?'#1D9E75':d.dir==='neg'?'#E24B4A':'#888780';

      db.innerHTML += `<div class="tli"><div class="tld" style="background:${dc}"></div><div class="tlc"><div class="tlh"><div class="tln">${d.name}</div><span class="imp ${d.dir}">${d.imp} est.</span></div><div class="tlm"><span class="tlb ${d.tc}">${d.tc.replace('t-','')}</span><span class="tlb ${d.sc}">${d.sc.replace('s-','')}</span><span class="tlb" style="background:var(--bg2);color:var(--text2)">${d.dist}</span></div><div class="tldsc">${d.desc}</div><div class="tlsrc">Source: ${d.src}</div></div></div>`;

    });

  });

}



function buildPlanningTracker() {

  const apps = PA[cx], tb = document.getElementById('patb'); tb.innerHTML='';

  apps.forEach(a => {

    tb.innerHTML += `<tr><td style="font-family:monospace;font-size:11px;color:var(--text2)">${a.ref}</td><td>${a.addr}</td><td style="font-size:11px;color:var(--text2)">${a.type}</td><td><span class="tlb ${a.cls}">${a.status}</span></td><td style="font-size:12px;color:var(--text2)">${a.date}</td><td style="font-size:12px;font-weight:500;color:${a.imp.startsWith('+')?'#1D9E75':a.imp.startsWith('-')?'#E24B4A':'var(--text2)'}">${a.imp}</td></tr>`;

  });

}



// ── POLICY MAP ─────────────────────────────────────────────────────────

function calcRegionScores() {

  const scores = {};

  REGIONS.forEach(r => { const m=LCOEF[r.id]||[]; scores[r.id]=LEV_IDS.reduce((s,id,i)=>s+(lv[id]||0)/LEV_UNITS[i]*BASE_EFF[i]*(m[i]||1),0); });

  return scores;

}



function scoreColor(s) {

  if(s>3)  return {fill:'#1D9E75',text:'#E1F5EE'};

  if(s>1)  return {fill:'#9FE1CB',text:'#04342C'};

  if(s>-1) return {fill:'#D3D1C7',text:'#2C2C2A'};

  if(s>-3) return {fill:'#F5C4B3',text:'#4A1B0C'};

  return    {fill:'#D85A30',text:'#FAEEDD'};

}



function buildPolicyMap() {

  const TW=82,TH=52,GAP=6,PAD=8, scores=calcRegionScores();

  const W=PAD*2+3*(TW+GAP)-GAP, H=PAD*2+5*(TH+GAP)-GAP;

  let svg=`<svg width="100%" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;

  REGIONS.forEach(r => {

    const x=PAD+r.col*(TW+GAP), y=PAD+r.row*(TH+GAP), s=scores[r.id]||0, {fill,text}=scoreColor(s);

    svg += `<g style="cursor:pointer"><rect x="${x}" y="${y}" width="${TW}" height="${TH}" rx="7" fill="${fill}" stroke="rgba(0,0,0,.08)" stroke-width="0.5"/><text x="${x+TW/2}" y="${y+TH/2-7}" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="12" font-weight="500" fill="${text}">${r.name}</text><text x="${x+TW/2}" y="${y+TH/2+9}" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="11" fill="${text}" opacity=".85">${s>0?'+':''}${s.toFixed(1)}%</text></g>`;

  });

  svg += '</svg>';

  document.getElementById('tilemap').innerHTML = svg;

  const sorted = [...REGIONS].sort((a,b)=>(scores[b.id]||0)-(scores[a.id]||0));

  const maxAbs = Math.max(...sorted.map(r=>Math.abs(scores[r.id]||0)),1);

  document.getElementById('regscores').innerHTML = sorted.map(r => {

    const s=scores[r.id]||0, {fill}=scoreColor(s), bw=Math.round(Math.abs(s)/maxAbs*100);

    return`<div class="rs-row"><span class="rs-name">${r.name}</span><div style="flex:1;margin:0 8px"><div class="rs-bar" style="width:${bw}%;background:${fill};min-width:3px"></div></div><span class="rs-score" style="color:${s>0?'#1D9E75':s<0?'#E24B4A':'var(--text2)'}">${s>0?'+':''}${s.toFixed(1)}%</span></div>`;

  }).join('');

  const active = LEVERS.filter(l=>lv[l.id]!==0);

  document.getElementById('scen-lbl').textContent = active.length ? active.map(l=>`${l.lbl.split(' ').slice(0,2).join(' ')}: ${lv[l.id]}${l.unit}`).join(' · ') : 'Baseline — no levers active';

}



// ── AREA AGENT ─────────────────────────────────────────────────────────

function updateAALeverSummary() {

  const active = LEVERS.filter(l=>lv[l.id]!==0);

  document.getElementById('aa-ls').textContent = active.length ? active.map(l=>`${l.lbl.split(' ').slice(0,2).join(' ')}: ${lv[l.id]}${l.unit}`).join(', ') : 'None — baseline scenario';

}



async function runAreaAgent() {

  const btn=document.getElementById('aabtn'), res=document.getElementById('aa-res');

  btn.disabled=true; res.innerHTML='<div style="padding:2rem;text-align:center;color:var(--text2)"><span class="spin"></span> Agent analysing UK regions...</div>';

  const scores = calcRegionScores();

  const region_data = REGIONS.map(r => ({name:r.name, aff:r.aff, gr:(r.gr*100).toFixed(1), score:(scores[r.id]||0).toFixed(1)}));

  const result = await API.aiAreaAgent({

    budget: document.getElementById('aa-b').value,

    property_type: document.getElementById('aa-t').value,

    commute: document.getElementById('aa-c').value,

    priority: document.getElementById('aa-p').value,

    levers: Object.fromEntries(LEV_IDS.map(id=>[id,lv[id]])),

    region_data

  });

  if (!result) { res.innerHTML='<div class="aiout" style="color:#E24B4A">Error. Please try again.</div>'; btn.disabled=false; return; }

  const data = typeof result === 'string' ? null : result;

  if (!data || !data.areas) { res.innerHTML=`<div class="aiout">${typeof result==='string'?result:'No results.'}</div>`; btn.disabled=false; return; }

  renderAreaResults(data);

  btn.disabled=false;

}



function renderAreaResults(data) {

  const res=document.getElementById('aa-res');

  const rk=['#EF9F27','#888780','#D85A30','#7F77DD','#378ADD'];

  res.innerHTML=`<div style="font-size:13px;color:var(--text2);padding:10px 14px;background:var(--bg2);border-radius:var(--radius);margin-bottom:12px">${data.summary||''}</div>`+

  data.areas.map(a=>{

    const dims=['growth','affordability','infrastructure','policy','liveability'];

    const dlbls=['Growth','Affordability','Infrastructure','Policy','Liveability'];

    return`<div class="ac"><div class="ach"><span class="rnk" style="color:${rk[a.rank-1]||'#888'}">#${a.rank}</span><div><div class="an">${a.name}</div><div class="as">${a.region} · ${a.postcode} · ${a.score}/100</div></div></div>

      <div class="adims">${dims.map((d,i)=>`<div class="adim"><div class="adimv">${(a.scores||{})[d]||'—'}</div><div>${dlbls[i]}</div></div>`).join('')}</div>

      <div class="arat"><strong>${a.headline}</strong><br>${a.rationale}</div>

      <div class="arisk">⚠ ${a.watch_out}</div></div>`;

  }).join('');

}



// ── BENCHMARK ──────────────────────────────────────────────────────────

function buildBench() {

  const p=prop; if(CH.bn) CH.bn.destroy();

  CH.bn=new Chart(document.getElementById('cbn'),{type:'bar',data:{labels:['Price per sq ft (£)','Affordability (×earnings)'],datasets:[

    {label:'This property',data:[p.ppsqft,p.aff],backgroundColor:'#378ADDbb',borderRadius:4,borderSkipped:false},

    {label:'Regional avg', data:[p.rPpsqft,p.rAff],backgroundColor:'#EF9F27bb',borderRadius:4,borderSkipped:false},

    {label:'England avg',  data:[p.nPpsqft,8.3],backgroundColor:'#88878077',borderRadius:4,borderSkipped:false}]},

    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:'bottom',labels:{font:{size:11},color:'#888',boxWidth:10,boxHeight:10,padding:8}}},

      scales:{x:{grid:{display:false},ticks:{color:'#888',font:{size:11}}},y:{grid:{color:'rgba(128,128,128,.06)'},ticks:{color:'#888',font:{size:11}}}}}});

}



function buildReturn() {

  const p=prop, b=gr(p.region), cg=Math.round((Math.pow(1+b,10)-1)*100);

  if(CH.rt) CH.rt.destroy();

  CH.rt=new Chart(document.getElementById('crt'),{type:'bar',data:{labels:['Property (cap+yield)','FTSE All-Share','Cash/ISA','Gilts'],datasets:[{data:[cg+32,82,24,18],backgroundColor:['#378ADDbb','#1D9E75bb','#888780bb','#EF9F27bb'],borderRadius:4,borderSkipped:false}]},

    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{color:'#888',font:{size:11}}},y:{grid:{color:'rgba(128,128,128,.06)'},ticks:{color:'#888',font:{size:10},callback:v=>v+'%'}}}}});

}



function buildCosts() {

  const p=prop,mtg=Math.round(p.cur*.8*.055*1.1),mnt=Math.round(p.cur*.01),ct=Math.round(2200+p.aff*100),ins=Math.round(p.cur*.003);

  if(CH.ct) CH.ct.destroy();

  CH.ct=new Chart(document.getElementById('cct'),{type:'doughnut',data:{labels:['Mortgage','Maintenance','Council tax','Insurance'],datasets:[{data:[mtg,mnt,ct,ins],backgroundColor:['#378ADDbb','#EF9F27bb','#7F77DDbb','#1D9E75bb'],borderWidth:0}]},

    options:{responsive:true,maintainAspectRatio:false,cutout:'55%',plugins:{legend:{display:true,position:'bottom',labels:{font:{size:11},color:'#888',boxWidth:10,boxHeight:10,padding:7}},tooltip:{callbacks:{label:c=>`£${c.raw.toLocaleString()}/yr`}}}}});

}



// ── INIT ───────────────────────────────────────────────────────────────

buildSliders();

buildPolicyMap();

updateAALeverSummary();

go('cf', document.querySelector('.pill'));
