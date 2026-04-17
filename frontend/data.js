// ── STATIC DATA ───────────────────────────────────────────────────────
// Property profiles, neighbourhood data, planning applications.
// In production these are replaced by live API calls — see api.js

const PROPS = {
  cf: { addr:'14 Castle Street, Cardiff CF10 1BT', type:'Mid-terrace', beds:3, sqft:1020, tenure:'Freehold', council:'Cardiff City Council',
    tx:[{yr:1997,p:68000,ctx:'Pre-devolution Cardiff'},{yr:2003,p:112000,ctx:'Post-devolution boom'},{yr:2008,p:178000,ctx:'Pre-crash peak'},{yr:2013,p:162000,ctx:'Post-crisis trough'},{yr:2018,p:224000,ctx:'Brexit uncertainty'},{yr:2022,p:287000,ctx:'Post-COVID surge'}],
    cur:312000, region:'Wales', ppsqft:306, rPpsqft:280, nPpsqft:340, aff:6.8, rAff:5.4,
    pi:[{l:'Help to Buy',v:18000,c:'#E24B4A'},{l:'Low interest rates',v:34000,c:'#378ADD'},{l:'Right to Buy legacy',v:-8000,c:'#888780'},{l:'Planning restrictions',v:22000,c:'#EF9F27'},{l:'Devolution investment',v:11000,c:'#1D9E75'}],
    pnote:'Low interest rates and planning restrictions account for over 60% of real-terms growth since 2010. Help to Buy added ~5.8% in this postcode area.' },
  sw: { addr:'7 Brixton Hill, London SW2 1RJ', type:'Victorian terraced', beds:3, sqft:1180, tenure:'Freehold', council:'London Borough of Lambeth',
    tx:[{yr:1996,p:92000,ctx:'Post-recession London'},{yr:2001,p:198000,ctx:'Dot-com surge'},{yr:2007,p:368000,ctx:'Pre-crash peak'},{yr:2012,p:341000,ctx:'Olympic uplift'},{yr:2016,p:598000,ctx:'London peak/Brexit'},{yr:2021,p:672000,ctx:'Pandemic shift'}],
    cur:718000, region:'London', ppsqft:609, rPpsqft:680, nPpsqft:340, aff:12.3, rAff:12.3,
    pi:[{l:'Help to Buy',v:42000,c:'#E24B4A'},{l:'Low interest rates',v:88000,c:'#378ADD'},{l:'Stamp duty holiday',v:28000,c:'#7F77DD'},{l:'Planning restrictions',v:74000,c:'#EF9F27'},{l:'Foreign investment',v:36000,c:'#D85A30'}],
    pnote:'Supply constraints (+£74k) and low borrowing costs (+£88k) dominate. At 12.3× earnings this area sits at critical affordability pressure.' },
  mn: { addr:'23 Wilmslow Road, Manchester M14 5TQ', type:'Semi-detached', beds:4, sqft:1340, tenure:'Freehold', council:'Manchester City Council',
    tx:[{yr:1998,p:58000,ctx:'Pre-regeneration'},{yr:2004,p:118000,ctx:'Northern Quarter boom'},{yr:2009,p:148000,ctx:'Mild crisis impact'},{yr:2014,p:172000,ctx:'Northern Powerhouse'},{yr:2019,p:238000,ctx:'HS2 premium'},{yr:2023,p:298000,ctx:'Post-pandemic demand'}],
    cur:312000, region:'North West', ppsqft:233, rPpsqft:220, nPpsqft:340, aff:5.9, rAff:5.9,
    pi:[{l:'Help to Buy',v:16000,c:'#E24B4A'},{l:'Low interest rates',v:28000,c:'#378ADD'},{l:'Northern Powerhouse',v:14000,c:'#7F77DD'},{l:'HS2 proximity',v:9000,c:'#1D9E75'},{l:'Permitted development',v:-6000,c:'#888780'}],
    pnote:'Northern Powerhouse policy added ~4.5% premium. HS2 uncertainty moderated infrastructure premium since 2023.' },
  bs: { addr:'9 Clifton Road, Bristol BS8 1AF', type:'Georgian terraced', beds:4, sqft:1560, tenure:'Leasehold', council:'Bristol City Council',
    tx:[{yr:1999,p:142000,ctx:'Bristol tech growth'},{yr:2005,p:268000,ctx:'South West surge'},{yr:2010,p:298000,ctx:'Post-crisis dip'},{yr:2015,p:448000,ctx:'Remote work begins'},{yr:2020,p:612000,ctx:'COVID premium'},{yr:2023,p:698000,ctx:'Rate rises cool'}],
    cur:724000, region:'South West', ppsqft:464, rPpsqft:420, nPpsqft:340, aff:8.9, rAff:8.9,
    pi:[{l:'Help to Buy',v:38000,c:'#E24B4A'},{l:'Low interest rates',v:72000,c:'#378ADD'},{l:'Remote work migration',v:44000,c:'#7F77DD'},{l:'Planning restrictions',v:56000,c:'#EF9F27'},{l:'Green Belt constraints',v:31000,c:'#D85A30'}],
    pnote:'Remote work added ~£44k post-2020. Green Belt constraints significantly widen the affordability gap.' }
};

const NB = {
  cf:[{yr:2025,name:'South Wales Metro Central Link',tc:'t-trn',sc:'s-con',dist:'0.2mi',imp:'+3%',dir:'pos',desc:'New tram network Cardiff Bay to city centre. Journey time reduced to 8 min.',src:'Transport for Wales'},
      {yr:2026,name:'Central Quay Residential',tc:'t-res',sc:'s-con',dist:'0.3mi',imp:'+2%',dir:'pos',desc:'450 build-to-rent apartments increasing waterfront amenity.',src:'Cardiff Council'},
      {yr:2026,name:'Callaghan Square Phase 4',tc:'t-com',sc:'s-apr',dist:'0.4mi',imp:'+1.5%',dir:'pos',desc:'180,000 sq ft Grade A office — 1,800 jobs on completion.',src:'Cardiff Council'},
      {yr:2027,name:'Cardiff Bus Interchange upgrade',tc:'t-trn',sc:'s-pln',dist:'0.5mi',imp:'+1%',dir:'pos',desc:'Modernised interchange improving South Wales connectivity.',src:'Cardiff City Deal'}],
  sw:[{yr:2025,name:'Brixton Arches Phase 2',tc:'t-ret',sc:'s-con',dist:'0.2mi',imp:'+2.5%',dir:'pos',desc:'Railway arch restoration for independent retail and workspace.',src:'LB Lambeth'},
      {yr:2026,name:'Coldharbour Lane affordable housing',tc:'t-res',sc:'s-apr',dist:'0.3mi',imp:'-1%',dir:'neg',desc:'180 affordable units — modest dampening on open market prices.',src:'LB Lambeth'},
      {yr:2027,name:'Brixton Southern Gateway',tc:'t-mix',sc:'s-pln',dist:'0.5mi',imp:'+3%',dir:'pos',desc:'120 homes, retail, improved public space around station.',src:'TfL / LB Lambeth'}],
  mn:[{yr:2025,name:'Oxford Road BRT upgrade',tc:'t-trn',sc:'s-con',dist:'0.3mi',imp:'+2%',dir:'pos',desc:'Bus Rapid Transit — city centre travel reduced to 12 minutes.',src:'GMCA'},
      {yr:2026,name:'Levenshulme Market redevelopment',tc:'t-ret',sc:'s-con',dist:'0.6mi',imp:'+1.5%',dir:'pos',desc:'Permanent covered market anchoring Levenshulme regeneration.',src:'Manchester City Council'},
      {yr:2027,name:'Fallowfield District Centre',tc:'t-mix',sc:'s-pln',dist:'0.3mi',imp:'+3%',dir:'pos',desc:'Mixed-use regeneration: retail, housing, public realm.',src:'Manchester City Council'}],
  bs:[{yr:2025,name:'Clifton Down Centre refurbishment',tc:'t-ret',sc:'s-con',dist:'0.3mi',imp:'+1.5%',dir:'pos',desc:'Comprehensive retail and public realm improvement.',src:'Bristol City Council'},
      {yr:2026,name:'Clifton Village pedestrianisation',tc:'t-pub',sc:'s-apr',dist:'0.4mi',imp:'+3%',dir:'pos',desc:'Partial pedestrianisation — similar schemes show 3–5% uplift within 500m.',src:'Bristol City Council'},
      {yr:2030,name:'Bristol Metro Phase 1',tc:'t-trn',sc:'s-pln',dist:'0.8mi',imp:'+4%',dir:'pos',desc:'Urban rail — Clifton is a priority route.',src:'West of England CA'}]
};

const PA = {
  cf:[{ref:'24/02891/FUL',addr:'8 Castle Street CF10',type:'Change of use — restaurant',status:'Approved',date:'Mar 2024',cls:'p-app',imp:'Neutral'},
      {ref:'24/03102/FUL',addr:'Castle Buildings, Mill Lane',type:'22 flats + retail',status:'Approved',date:'Jan 2024',cls:'p-app',imp:'+0.8%'},
      {ref:'24/01547/ADV',addr:'20 Castle Street',type:'Advertisement consent',status:'Pending',date:'—',cls:'p-pen',imp:'Neutral'},
      {ref:'24/03445/RCN',addr:'5 Castle Street',type:'Retrospective planning',status:'Pending',date:'—',cls:'p-pen',imp:'—'},
      {ref:'23/02156/FUL',addr:'28–30 Castle Street',type:'12 residential flats',status:'Refused',date:'Nov 2023',cls:'p-ref',imp:'Neutral'}],
  sw:[{ref:'23/04521/FUL',addr:'12 Brixton Hill SW2',type:'Basement extension',status:'Approved',date:'Feb 2024',cls:'p-app',imp:'Neutral'},
      {ref:'24/00234/FUL',addr:'18–22 Brixton Hill',type:'6 units above retail',status:'Pending',date:'—',cls:'p-pen',imp:'+0.5%'},
      {ref:'22/04567/FUL',addr:'Brixton Hill Court',type:'45 affordable homes',status:'Under construction',date:'Due 2025',cls:'p-con',imp:'-0.5%'},
      {ref:'24/01102/HH',addr:'3 Brixton Hill',type:'Single-storey rear extension',status:'Approved',date:'Jan 2024',cls:'p-app',imp:'Neutral'}],
  mn:[{ref:'24/65321/FUL',addr:'28 Wilmslow Road M14',type:'HMO 12 rooms',status:'Refused',date:'Apr 2024',cls:'p-ref',imp:'Neutral'},
      {ref:'24/64890/FUL',addr:'Wilmslow/Dickenson Rd',type:'Retail + 8 flats',status:'Approved',date:'Mar 2024',cls:'p-app',imp:'+1%'},
      {ref:'23/63445/FUL',addr:'Former garage site M14',type:'16 residential units',status:'Under construction',date:'Due 2025',cls:'p-con',imp:'+0.5%'},
      {ref:'24/66123/COU',addr:'42 Wilmslow Road',type:'Change of use — food & drink',status:'Approved',date:'Feb 2024',cls:'p-app',imp:'Neutral'}],
  bs:[{ref:'24/01823/F',addr:'15 Clifton Road BS8',type:'Loft conversion + dormer',status:'Approved',date:'Feb 2024',cls:'p-app',imp:'Neutral'},
      {ref:'24/02341/F',addr:'Clifton/Alma Rd corner',type:'8 luxury apartments',status:'Pending',date:'—',cls:'p-pen',imp:'+1%'},
      {ref:'22/03456/F',addr:'Former depot site BS8',type:'45 mixed-tenure homes',status:'Under construction',date:'Due 2025',cls:'p-con',imp:'+0.3%'}]
};

const REGIONS = [
  {id:'sco',name:'Scotland',    col:1,row:0,aff:5.1,gr:.040},
  {id:'nw', name:'North West',  col:0,row:1,aff:5.9,gr:.044},
  {id:'ne', name:'North East',  col:1,row:1,aff:4.8,gr:.038},
  {id:'wal',name:'Wales',       col:0,row:2,aff:5.4,gr:.048},
  {id:'wm', name:'West Mids',   col:1,row:2,aff:6.7,gr:.046},
  {id:'em', name:'East Mids',   col:2,row:2,aff:6.2,gr:.046},
  {id:'yh', name:'Yorkshire',   col:1,row:3,aff:5.8,gr:.042},
  {id:'ee', name:'East England',col:2,row:3,aff:8.4,gr:.050},
  {id:'sw', name:'South West',  col:0,row:4,aff:8.9,gr:.055},
  {id:'lnd',name:'London',      col:1,row:4,aff:12.3,gr:.062},
  {id:'se', name:'South East',  col:2,row:4,aff:9.8,gr:.055},
];

const LCOEF = {
  sco:[0.7,0.8,1.0,0.5,0.6,0.4,0.8,0.5], nw:[1.1,0.9,1.1,0.8,0.8,0.7,0.9,0.6],
  ne:[0.5,0.7,1.2,0.4,0.6,0.3,0.7,0.4],  wal:[0.7,0.8,0.9,0.6,0.5,0.5,0.7,1.4],
  wm:[1.0,0.9,1.0,0.9,0.8,0.8,0.9,0.5],  em:[0.8,0.9,1.0,0.8,0.6,0.6,0.8,0.5],
  yh:[0.9,0.8,1.0,0.7,0.7,0.5,0.8,0.5],  ee:[1.1,1.0,0.9,1.1,0.9,1.0,1.0,0.9],
  lnd:[1.8,1.4,0.8,2.0,1.8,2.0,1.5,0.8], se:[1.5,1.2,0.9,1.6,1.2,1.6,1.3,1.0],
  sw:[1.0,1.0,0.8,0.9,0.7,0.6,1.0,1.8]
};

const BASE_EFF = [-0.4,-0.9,0.35,-0.5,-0.25,-0.6,0.4,-0.15];
const LEV_UNITS = [10,0.25,10,10,5,5,10,0.5];
const LEV_IDS = ['supply','rates','htb','planning','rent','greenbelt','stampduty','emptyhomes'];

const LEVERS = [
  {id:'supply',   lbl:'New homes built annually',   unit:'k extra', min:0,  max:150, step:10,  def:0, desc:'Additional completions above 46k/yr England baseline'},
  {id:'rates',    lbl:'Interest rate change',        unit:'% pts',  min:-2, max:3,   step:.25, def:0, desc:'Change from current BoE base rate'},
  {id:'htb',      lbl:'Help to Buy extension',       unit:'% uptake',min:0, max:100, step:10,  def:0, desc:'Equity loan scheme — stimulates demand esp. new-build'},
  {id:'planning', lbl:'Planning liberalisation',     unit:'% zones', min:0, max:100, step:10,  def:0, desc:'Proportion of restricted zones opened — expands supply pipeline'},
  {id:'rent',     lbl:'Rent controls introduced',    unit:'% cap',   min:0, max:50,  step:5,   def:0, desc:'Annual rent increase cap — reduces BTL yields and investor demand'},
  {id:'greenbelt',lbl:'Green belt release',          unit:'% area',  min:0, max:40,  step:5,   def:0, desc:'Local green belt opened — major supply effect near constrained cities'},
  {id:'stampduty',lbl:'Stamp duty reduction',        unit:'% cut',   min:0, max:100, step:10,  def:0, desc:'Reduction in SDLT — stimulates transaction volume'},
  {id:'emptyhomes',lbl:'Empty homes levy',           unit:'% p.a.',  min:0, max:5,   step:.5,  def:0, desc:'Annual levy on empty/second homes — brings dormant stock to market'},
];

const PRESETS = {
  labour:   {supply:50,rates:-.5,htb:0,planning:60,rent:10,greenbelt:10,stampduty:0,emptyhomes:1,lbl:'Labour housing plan'},
  highrates:{supply:0,rates:2,htb:0,planning:0,rent:0,greenbelt:0,stampduty:0,emptyhomes:0,lbl:'High rate environment'},
  greenbelt:{supply:80,rates:0,htb:0,planning:80,rent:0,greenbelt:35,stampduty:0,emptyhomes:0,lbl:'Green belt liberation'},
  rentctl:  {supply:0,rates:0,htb:0,planning:0,rent:40,greenbelt:0,stampduty:0,emptyhomes:0,lbl:'Rent control regime'},
  austerity:{supply:0,rates:1.5,htb:0,planning:0,rent:0,greenbelt:0,stampduty:0,emptyhomes:0,lbl:'Austerity scenario'},
  reset:    {supply:0,rates:0,htb:0,planning:0,rent:0,greenbelt:0,stampduty:0,emptyhomes:0,lbl:'Reset all'},
};

const POL_EVTS = [
  {yr:2009,id:'qe', lbl:'QE begins',          c:'#378ADD',note:'Rate suppression'},
  {yr:2013,id:'htb',lbl:'Help to Buy',         c:'#E24B4A',note:'Demand stimulus'},
  {yr:2020,id:'sdh',lbl:'Stamp duty holiday',  c:'#7F77DD',note:'COVID stimulus'},
  {yr:2022,id:'rts',lbl:'Rate rises',          c:'#EF9F27',note:'BoE tightening'},
];

const POL_TL = [
  {yr:2009,lbl:'QE begins',           c:'#378ADD',det:'BoE asset purchases suppress mortgage rates, driving demand and prices upward.'},
  {yr:2013,lbl:'Help to Buy launch',  c:'#E24B4A',det:'Equity loan scheme boosted new-build prices 5–8% in eligible areas.'},
  {yr:2016,lbl:'Brexit vote',         c:'#EF9F27',det:'Uncertainty cooled London — regional cities saw relative uplift.'},
  {yr:2020,lbl:'Stamp duty holiday',  c:'#7F77DD',det:'SDLT removed on first £500k — estimated 6% demand stimulus nationally.'},
  {yr:2022,lbl:'Rate rises begin',    c:'#D85A30',det:'BoE rate rose from 0.1% to 5.25% by 2023. Transaction volumes fell 20%.'},
  {yr:2024,lbl:'NPPF reforms',        c:'#1D9E75',det:'New planning framework increases mandatory housing targets for councils.'},
];

const ALLYR = [];
for (let y = 1995; y <= 2030; y++) ALLYR.push(y);
