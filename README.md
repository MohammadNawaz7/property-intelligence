# Property & Policy Intelligence Platform
## Deployment Guide — 15 Minutes to Live

---

## What's in this package

```
property-intelligence/
├── frontend/           ← Deploy to Netlify (your website)
│   ├── index.html      ← Main app
│   ├── config.js       ← API URL config — edit after backend deploy
│   ├── api.js          ← All backend API calls
│   ├── data.js         ← Static data (regions, properties, etc.)
│   └── app.js          ← All UI logic and charts
├── backend/            ← Deploy to Railway (your server)
│   ├── main.py         ← FastAPI app — Land Registry, ONS, AI proxy
│   ├── requirements.txt
│   ├── railway.json    ← Railway config
│   ├── Procfile        ← Start command
│   └── .env.example    ← Copy to .env and add your API key
├── netlify.toml        ← Netlify config
└── .gitignore          ← Never commits .env or secrets
```

---

## STEP 1 — Get your Anthropic API key (2 min)

1. Go to **console.anthropic.com**
2. Sign in / create account
3. Go to API Keys → Create Key
4. Copy the key — you'll need it in Step 3

---

## STEP 2 — Push to GitHub (3 min)

1. Go to **github.com** → New repository → Name it `property-intelligence`
2. Make it **public** (required for free Netlify/Railway)
3. On your computer, open Terminal / Command Prompt in this folder:

```bash
git init
git add .
git commit -m "Initial commit — Property Policy Intelligence v3"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/property-intelligence.git
git push -u origin main
```

---

## STEP 3 — Deploy Backend to Railway (5 min)

1. Go to **railway.app** → Sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `property-intelligence` repo
4. Railway detects Python automatically via Nixpacks
5. Set the **root directory** to `backend`
6. Go to **Variables** tab → Add:
   ```
   ANTHROPIC_API_KEY = sk-ant-your-key-here
   ```
7. Click **Deploy** — wait ~2 min
8. Go to **Settings** → **Domains** → copy your Railway URL
   - It looks like: `https://property-intelligence-production-abc123.up.railway.app`

---

## STEP 4 — Update Frontend Config (1 min)

Open `frontend/config.js` and replace:
```javascript
"https://YOUR-RAILWAY-URL.up.railway.app"
```
with your actual Railway URL from Step 3.

Then commit and push:
```bash
git add frontend/config.js
git commit -m "Add Railway backend URL"
git push
```

---

## STEP 5 — Deploy Frontend to Netlify (3 min)

1. Go to **netlify.com** → Sign in with GitHub
2. Click **Add new site** → **Import an existing project**
3. Connect GitHub → Select `property-intelligence` repo
4. Build settings:
   - **Base directory:** (leave blank)
   - **Build command:** (leave blank)
   - **Publish directory:** `frontend`
5. Click **Deploy site**
6. Your site is live at `https://random-name.netlify.app`

**Optional:** Go to Site Settings → Domain Management → Add custom domain

---

## STEP 6 — Verify Everything Works

Visit your Netlify URL and:
- [ ] Sample addresses load correctly
- [ ] All 7 tabs work
- [ ] Charts render
- [ ] Scenarios tab: move a lever, check forecast updates
- [ ] Policy Map tab: check map colours
- [ ] Scenarios tab: click "Generate what-if analysis" — AI response appears
- [ ] Area Agent tab: fill criteria and click Find — AI ranked results appear

---

## After Deployment — It Runs Itself

Once live:
- **Netlify** serves your frontend 24/7 from a global CDN. Zero maintenance.
- **Railway** runs your Python backend 24/7. Restarts automatically if it crashes.
- **Updates:** Change any code → `git push` → both redeploy automatically within 60 seconds.
- **Costs:** Free tier covers a portfolio-level project. Only cost is Anthropic API (~£0.005 per AI call).

---

## Adding Live Land Registry Data

The backend already has the Land Registry API wired up in `main.py`.

To activate it in the frontend, open `frontend/config.js` and set:
```javascript
USE_LIVE_LAND_REGISTRY: true
```

Then in `frontend/app.js`, the `go()` function can call `API.fetchProperty(postcode)` 
and replace the static `PROPS` data with real transactions.

Full Land Registry integration guide: https://landregistry.data.gov.uk/

---

## Troubleshooting

**AI buttons not working:**
- Check Railway Variables has `ANTHROPIC_API_KEY` set correctly
- Check `frontend/config.js` has the correct Railway URL

**CORS errors in browser console:**
- Check your Railway URL in `config.js` has no trailing slash
- Make sure you deployed after updating config.js

**Railway deploy failing:**
- Check the root directory is set to `backend` in Railway settings
- Check `requirements.txt` is in the `backend` folder

---

## Your CV / LinkedIn Description

> **UK Property & Policy Intelligence Platform** | Python/FastAPI, JavaScript, Chart.js, Claude API, Land Registry API
> 
> Full-stack web application analysing UK property markets through a policy lens. Features: real-time Land Registry price history, ARIMA forecast modelling, 8-lever interactive policy scenario engine, regional choropleth policy winners map, neighbourhood development intelligence board, live planning application tracker, and an AI-powered Area Intelligence Agent that ranks UK postcodes against buyer criteria using Claude's API. Deployed on Netlify (frontend) and Railway (backend). Live at: [your-url].netlify.app
