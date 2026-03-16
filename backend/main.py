from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
import json
import time
from typing import Optional
from pydantic import BaseModel

app = FastAPI(title="Property Policy Intelligence API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

cache = {}
CACHE_TTL = 3600

def get_cache(key):
    if key in cache:
        val, ts = cache[key]
        if time.time() - ts < CACHE_TTL:
            return val
    return None

def set_cache(key, val):
    cache[key] = (val, time.time())

class AIRequest(BaseModel):
    prompt: str
    max_tokens: Optional[int] = 1000

class AreaAgentRequest(BaseModel):
    budget: str
    property_type: str
    commute: str
    priority: str
    levers: dict
    region_data: list

async def call_gemini(prompt: str, max_tokens: int = 1000) -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY not set in environment variables")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"maxOutputTokens": max_tokens, "temperature": 0.7}
    }

    async with httpx.AsyncClient(timeout=40.0) as client:
        resp = await client.post(url, json=body, headers={"Content-Type": "application/json"})
        if resp.status_code == 200:
            data = resp.json()
            try:
                return data["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError):
                raise HTTPException(status_code=502, detail="Unexpected Gemini response")
        elif resp.status_code == 429:
            raise HTTPException(status_code=429, detail="Rate limit — try again in a moment")
        else:
            raise HTTPException(status_code=502, detail=f"Gemini error: {resp.status_code}")

@app.get("/")
def root():
    return {"status": "online", "service": "Property Policy Intelligence API", "ai": "Gemini 1.5 Flash"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/api/property")
async def get_property(postcode: str = "", address: str = ""):
    if not postcode and not address:
        raise HTTPException(status_code=400, detail="Provide postcode or address")
    cache_key = f"property_{postcode}_{address}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    pc = postcode.upper().replace(" ", "")
    query = f"""
    PREFIX ppd: <http://landregistry.data.gov.uk/def/ppi/>
    PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/>
    SELECT ?transactionDate ?pricePaid ?propertyType ?estateType ?paon ?street ?town
    WHERE {{
      ?transaction ppd:pricePaid ?pricePaid ;
                   ppd:transactionDate ?transactionDate ;
                   ppd:propertyType ?propertyType ;
                   ppd:estateType ?estateType ;
                   ppd:propertyAddress ?addr .
      ?addr lrcommon:postcode "{pc}" ;
            lrcommon:street ?street .
      OPTIONAL {{ ?addr lrcommon:paon ?paon }}
      OPTIONAL {{ ?addr lrcommon:town ?town }}
    }}
    ORDER BY ?transactionDate LIMIT 50
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                "https://landregistry.data.gov.uk/linked-data/ppd",
                params={"query": query, "_format": "json"},
                headers={"Accept": "application/sparql-results+json"}
            )
            if resp.status_code == 200:
                data = resp.json()
                bindings = data.get("results", {}).get("bindings", [])
                transactions = [{
                    "date": b.get("transactionDate", {}).get("value", ""),
                    "price": int(float(b.get("pricePaid", {}).get("value", 0))),
                    "property_type": b.get("propertyType", {}).get("value", "").split("/")[-1],
                    "street": b.get("street", {}).get("value", ""),
                    "paon": b.get("paon", {}).get("value", ""),
                } for b in bindings]
                result = {"postcode": postcode, "transactions": transactions, "count": len(transactions), "source": "HM Land Registry"}
                set_cache(cache_key, result)
                return result
            else:
                raise HTTPException(status_code=502, detail="Land Registry API error")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Land Registry timeout")

@app.get("/api/hpi")
async def get_hpi(region: str = "England"):
    cache_key = f"hpi_{region}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    region_codes = {"England":"DRQB","London":"DRQH","Wales":"DRQO","Scotland":"DRQS","North West":"DRQJ","South West":"DRQN","South East":"DRQM","Yorkshire":"DRQL"}
    code = region_codes.get(region, "DRQB")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"https://api.ons.gov.uk/v1/timeseries/{code}/dataset/MM23/data")
            if resp.status_code == 200:
                data = resp.json()
                months = data.get("months", [])
                result = {"region": region, "series": [{"date": m["label"], "value": float(m["value"])} for m in months[-60:] if m.get("value","").replace(".","").isdigit()], "source": "ONS HPI"}
                set_cache(cache_key, result)
                return result
    except Exception as e:
        return {"region": region, "series": [], "error": str(e)}

@app.get("/api/base-rate")
async def get_base_rate():
    return {"current_rate": 5.25, "source": "Bank of England", "note": "As of Q4 2024"}

@app.post("/api/ai/whatif")
async def ai_whatif(req: AIRequest):
    text = await call_gemini(req.prompt, req.max_tokens)
    return {"result": text}

@app.post("/api/ai/area-agent")
async def ai_area_agent(req: AreaAgentRequest):
    budget_map = {"sub200":"under £200k","200to350":"£200k-£350k","350to500":"£350k-£500k","500plus":"£500k+"}
    active_levers = [f"{k}: {v}" for k, v in req.levers.items() if v != 0]
    lever_text = "\n".join(active_levers) if active_levers else "Baseline"
    region_text = "\n".join([f"{r['name']}: affordability {r['aff']}x, growth {r['gr']}%/yr, policy score {r['score']}%" for r in req.region_data])

    prompt = f"""You are a UK housing area intelligence agent. Recommend the top 5 areas for this buyer.

BUYER CRITERIA:
Budget: {budget_map.get(req.budget, req.budget)}
Property type: {req.property_type}
Commute priority: {"Not important" if req.commute == "none" else f"Near {req.commute}"}
Priority: {req.priority}

POLICY SCENARIO:
{lever_text}

REGIONAL DATA:
{region_text}

Return ONLY valid JSON. No markdown, no backticks, no explanation outside JSON:
{{"summary":"One sentence finding","areas":[{{"rank":1,"name":"Specific area e.g. Rusholme Manchester","region":"North West","postcode":"M14","score":84,"scores":{{"growth":80,"affordability":88,"infrastructure":82,"policy":78,"liveability":80}},"headline":"Why this area","rationale":"2-3 sentences reasoning","watch_out":"Main risk"}}]}}
Exactly 5 areas. Scores 0-100."""

    text = await call_gemini(prompt, 1200)
    clean = text.replace("```json", "").replace("```", "").strip()
    try:
        parsed = json.loads(clean)
        return {"result": parsed}
    except json.JSONDecodeError:
        return {"result": text, "raw": True}

@app.get("/api/planning")
async def get_planning(postcode: str):
    return {"postcode": postcode, "applications": [], "note": "Connect local authority API for live data"}
