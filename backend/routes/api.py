import os
import json
import logging
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
logger = logging.getLogger(__name__)

OPENROUTER_KEYS = [k for k in [
    os.getenv("OPENROUTER_API_KEY_1"),
    os.getenv("OPENROUTER_API_KEY_2"),
    os.getenv("OPENROUTER_API_KEY_3"),
] if k]

_k1 = OPENROUTER_KEYS[0] if OPENROUTER_KEYS else None
_k2 = OPENROUTER_KEYS[1] if len(OPENROUTER_KEYS) > 1 else None
_k3 = OPENROUTER_KEYS[2] if len(OPENROUTER_KEYS) > 2 else None

OPENROUTER_FALLBACKS = [
    (_k1, "meta-llama/llama-3.3-70b-instruct:free"),
    (_k2, "meta-llama/llama-3.3-70b-instruct:free"),
    (_k1, "nousresearch/hermes-3-llama-3.1-405b:free"),
    (_k2, "qwen/qwen3-next-80b-a3b-instruct:free"),
    (_k3, "inclusionai/ling-2.6-flash:free"),
]

router = APIRouter()


class CampaignRequest(BaseModel):
    corridor: str
    audience: str
    pain_point: str
    tone: str
    platform: str
    campaign_goal: str
    number_of_scripts: int = 3


def openrouter_complete(prompt: str, max_tokens: int = 4000) -> str:
    last_err = None
    for api_key, model in OPENROUTER_FALLBACKS:
        if not api_key:
            continue
        try:
            resp = httpx.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.8,
                    "max_tokens": max_tokens,
                },
                timeout=60,
            )
            if resp.status_code == 429:
                last_err = Exception(f"429 rate-limited: {model}")
                continue
            resp.raise_for_status()
            data = resp.json()
            if "error" in data:
                raise Exception(data["error"].get("message", str(data["error"])))
            content = data["choices"][0]["message"]["content"]
            logger.info(f"[OpenRouter] succeeded model={model}")
            return content
        except Exception as e:
            logger.warning(f"[OpenRouter] model={model} failed: {e}")
            last_err = e
    raise RuntimeError(f"All OpenRouter fallbacks exhausted. Last: {last_err}")


BLAZE_FACTS = """
=== BLAZE PRODUCT FACTS — USE THESE SPECIFIC NUMBERS IN EVERY SCRIPT ===

WHO BLAZE IS:
- Blaze (blaze.money) is a YC S24-backed cross-border payments app — "Global Venmo for cross-border payments"
- Taglines: "Money Without Borders" / "Damn good payments"
- Built on stablecoin rails (USDC/USDT) — Stellar, Solana, Base, Ethereum, Polygon
- Founded by engineers from Spotify, backed by Y Combinator and Stellar Development Foundation

FEE STRUCTURE (always use exact numbers):
- Blaze: 0.5% flat conversion fee + real mid-market exchange rate (the rate you see on Google)
- Absolutely no wire fees, no hidden FX markup, no "international transfer surcharge"
- Western Union: 2–4% FX markup on top of inflated exchange rate + additional transfer fees
- Remitly: 0.5%–3.7% markup depending on speed + fees
- Concrete example: Send $200 → Blaze fee = ~$1 vs Western Union fee = ~$8–$16
- Annual cost of monthly $200 transfers: Blaze ~$12/year vs Western Union ~$96–$192/year
- Annual cost of monthly $500 transfers: Blaze ~$30/year vs Western Union ~$240–$480/year

SPEED:
- Transfers settle in seconds via stablecoin rails (not days like banks or wire transfers)
- US→Mexico via SPEI: money lands in recipient's Mexican bank account in seconds — they get a SPEI notification while you're still on the phone
- No 3-day waits, no "processing" delays, no bank holidays blocking transfers

FEATURES WORTH MENTIONING:
- Blaze Visa card (physical) — spend your Blaze balance anywhere Visa is accepted worldwide
- Payment links — send money to anyone; recipient doesn't even need the app
- Multi-currency accounts: US account (ACH/Zelle), EU account (IBAN/SEPA), Mexico account (CLABE/SPEI)
- Hold digital dollars (USDC) to protect savings from local currency inflation (peso, naira devaluation)
- Apple Pay and Google Pay support

TRUST SIGNALS (use sparingly, 1 per campaign):
- Backed by Y Combinator (S24) — same program that launched Airbnb, Stripe, Coinbase
- Registered MSB with FinCEN (US federal money services license)
- EU VASP licensed

=== END BLAZE FACTS ===
"""

CORRIDOR_CONTEXT = {
    "🇺🇸→🇲🇽 US → Mexico": "Primary live corridor — fully operational. SPEI transfers land in Mexican bank accounts in seconds. ~$1 fee on a $200 transfer. The US-Mexico corridor moves ~$63B/year in remittances — many senders are paying 4%+ to WU/Remitly.",
    "🇺🇸→🇮🇳 US → India": "Expanding corridor. 4M+ Indian immigrants in the US sent $32B home in 2023. Audience is tech-savvy, comparison-shops on fees, and is frustrated by Wise/Remitly FX markups.",
    "🇺🇸→🇵🇭 US → Philippines": "Expanding corridor. Philippines is one of the world's top remittance destinations ($38B/year). Filipino-Americans send money monthly to support extended family — strong emotional motivation.",
    "🇺🇸→🇳🇬 US → Nigeria": "Explicitly targeted expansion corridor. Nigeria is Africa's largest remittance destination. Nigerian diaspora is highly educated and vocal on social media. Naira devaluation (60%+ in 2 years) makes the 'hold USD' angle very strong.",
    "🇺🇸→🇻🇳 US → Vietnam": "Expanding corridor. 2M+ Vietnamese-Americans send $17B+ to Vietnam annually. Strong community loyalty and word-of-mouth culture.",
    "🇺🇸→🇩🇴 US → Dominican Republic": "Expanding corridor. Large DR diaspora in NY/NJ. Remittances make up 9% of Dominican GDP. Community is tightly knit — a recommendation spreads fast.",
    "🇺🇸→🇬🇹 US → Guatemala": "Expanding corridor. Remittances make up 19% of Guatemala's GDP — the highest dependency in Central America. Senders are acutely aware that every dollar lost to fees matters.",
    "🇺🇸→🇨🇴 US → Colombia": "Explicitly announced expansion. Strong digital nomad + expat angle alongside diaspora. Colombia has a growing tech-savvy middle class that's comfortable with fintech.",
    "🇬🇧→🇮🇳 UK → India": "Expanding corridor. UK has one of the largest Indian diaspora populations globally. Audience frustrated by Wise/Revolut fees and Barclays wire charges.",
    "🇬🇧→🇳🇬 UK → Nigeria": "Expanding corridor. Significant Nigerian community in the UK (700K+). Naira devaluation makes the 'protect your family's savings in USDC' angle very compelling.",
    "🇨🇦→🇮🇳 Canada → India": "Expanding corridor. Canada has 1.4M+ Indian immigrants and is growing fast. Post-study-permit community often sends money to family while building life in Canada.",
    "🇦🇪→🇵🇰 UAE → Pakistan": "Expanding corridor. UAE has 1.5M+ Pakistani workers — one of the world's busiest remittance routes. Senders are extremely fee-conscious; many send weekly in small amounts.",
}

FEW_SHOT_EXAMPLES = """
=== EXAMPLE SCRIPTS — MATCH THIS LEVEL OF SPECIFICITY ===

EXAMPLE 1 (Emotional, US→Mexico):
{
  "id": 1,
  "title": "She Got the SPEI Before I Hung Up",
  "angle": "Emotional",
  "hook": "My mom cried the first time the money arrived before I even hung up the phone.",
  "script": "I've been sending money home to Guadalajara every month since I moved to LA five years ago. For five years I watched my mom wait. Three days. Sometimes four. Refreshing her banking app, calling me back — mijo, it still hasn't arrived. Then I started using Blaze. Last month I sent her $300 while we were literally still on the phone. She heard the SPEI notification before we even said goodbye. I paid $1.50. With Western Union I was paying $12 every single time — that's over $120 a year. Gone. She didn't cry because of the speed. She cried because for once, it felt like I wasn't so far away.",
  "scene_breakdown": [
    "Creator in bedroom or car — quiet, personal setting — opens with the memory of mom waiting",
    "Live screen: opens Blaze, types $300, selects Mexico, fee shows $1.50 — not $12",
    "FaceTimes mom — she hears the SPEI ping on mom's phone before they hang up",
    "Western Union receipt on screen: $12.99 fee — then Blaze receipt: $1.50 — side by side"
  ],
  "cta": "Download Blaze. She'll have it before you finish saying goodbye.",
  "creator_direction": "Film in a car or bedroom — somewhere personal and quiet, not a kitchen. Soft lighting. The emotion should be understated and genuine, not performed. If you actually send money home, use your real receipts — it shows. End with a small, tired smile.",
  "hashtags": ["#remittance", "#sendmoneyhome", "#usamexicotransfer", "#blazemoney", "#familyfirst"],
  "estimated_duration": "50-60 seconds",
  "emotion_trigger": "relatability"
}

EXAMPLE 2 (Savings, US→Mexico):
{
  "id": 2,
  "title": "I Did the Math. Western Union Took $130 From Me.",
  "angle": "Savings",
  "hook": "I finally did the math on what Western Union charged me last year. I want to throw up.",
  "script": "Okay. I send $200 home to my family in Mexico every single month. I've been doing this for three years on Western Union. Last week I sat down and calculated what I actually paid in fees. Western Union charges 4% — that's $8 every transfer. Times 12 months: $96 a year. Times three years: almost $300 that should have gone to my mom. Three hundred dollars to Western Union. Then I found Blaze. 0.5% fee. The real mid-market exchange rate — the one you see on Google, not one they invented. My last transfer: $200 to Mexico, $1 fee. One dollar. Not eight. I'm never switching back.",
  "scene_breakdown": [
    "Creator at kitchen table with calculator — doing the math out loud on camera",
    "Screen recording: Western Union fee for $200 transfer — shows $7.99 fee and worse exchange rate",
    "Screen recording: Same $200 on Blaze — fee shows $1.00, real mid-market rate",
    "Creator looks at camera: 'Three years. Almost three hundred dollars. Gone.'"
  ],
  "cta": "Send your next transfer on Blaze. Keep the money in the family.",
  "creator_direction": "Kitchen table or desk, bright daylight. Matter-of-fact energy — not angry, just genuinely shocked by the math. Show real numbers on screen if you have them. Speak slowly and pause when you say the dollar amounts. That's where the video lands.",
  "hashtags": ["#moneytips", "#remittancetips", "#sendmoneyhome", "#blazemoney", "#savemoney"],
  "estimated_duration": "45-55 seconds",
  "emotion_trigger": "fear"
}

=== END EXAMPLES — now generate scripts at this level of specificity ===
"""


def build_prompt(req: CampaignRequest) -> str:
    corridor_note = CORRIDOR_CONTEXT.get(req.corridor, f"Growing corridor. Use the Blaze fee/speed facts above to make scripts specific.")

    return f"""You are a world-class UGC (user-generated content) growth strategist specializing in fintech and cross-border payments.

Your job: generate a complete UGC content experiment pack for Blaze. You have been given verified product facts — USE THEM. Scripts that don't reference specific numbers (fees, speed, corridors) will be rejected.

{BLAZE_FACTS}

CORRIDOR CONTEXT for {req.corridor}:
{corridor_note}

CAMPAIGN CONFIGURATION:
- Payment corridor: {req.corridor}
- Target audience: {req.audience}
- Core pain point: {req.pain_point}
- Content tone: {req.tone}
- Platform: {req.platform}
- Campaign goal: {req.campaign_goal}
- Number of script variants: {req.number_of_scripts}

{FEW_SHOT_EXAMPLES}

RULES — follow every one:
1. Reference SPECIFIC NUMBERS from the Blaze facts above (0.5% fee, $1 on $200, seconds, etc.) — no vague claims like "low fees" or "fast transfers"
2. Each script must sound like a real person from this exact audience talking to their phone camera — NOT a brand ad
3. Hook must work in under 2 seconds — lead with a specific fact, a question, or a personal story moment
4. Each script must take a distinct angle — no two scripts can use the same approach
5. Scene breakdowns must be filmable — specific locations, actions, what's on screen
6. CTAs feel natural, not corporate
7. Creator direction must be specific: exact setting, lighting, energy, pacing, what to show on screen
8. Hashtags mix ultra-niche + broad (e.g. #usamexicotransfer + #remittance + #sendmoneyhome)
9. Platform-native for {req.platform}: vertical video, hook in first 2 seconds, no B-roll dependencies

Return ONLY valid JSON, no markdown, no explanation:

{{
  "campaign_name": "<specific, memorable campaign name>",
  "target_insight": "<2 sentences: the specific psychological insight about why THIS audience cares — reference the corridor and pain point>",
  "corridor_context": "<1 sentence with a specific stat or fact about this corridor>",
  "scripts": [
    {{
      "id": 1,
      "title": "<specific, descriptive script title>",
      "angle": "<Savings | Speed | Emotional | Controversial | Educational | Relatable | FOMO>",
      "hook": "<exact opening line — specific, not generic — must stop the scroll in 2 seconds>",
      "script": "<full first-person script, 60-90 seconds spoken — use specific dollar amounts, fees, and Blaze facts>",
      "scene_breakdown": ["<specific filmable scene 1>", "<scene 2>", "<scene 3>", "<scene 4>"],
      "cta": "<natural, non-salesy call to action>",
      "creator_direction": "<specific: setting, lighting, energy, delivery speed, what to show on screen>",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
      "estimated_duration": "<e.g. 45-60 seconds>",
      "emotion_trigger": "<fear | curiosity | relatability | aspiration | humor>"
    }}
  ],
  "experiment_plan": {{
    "hypothesis": "<specific, testable hypothesis referencing the angle and audience>",
    "test_design": "<how many creators, which scripts to split-test, posting cadence>",
    "primary_metric": "<single most important metric for this campaign goal>",
    "metrics": ["<metric 1>", "<metric 2>", "<metric 3>", "<metric 4>", "<metric 5>"],
    "winning_signal": "<specific threshold — e.g. >3% CTR, >15% watch-through, or link click rate>",
    "timeline": "<realistic test timeline with milestones>"
  }}
}}

Generate exactly {req.number_of_scripts} scripts. Each must use real Blaze numbers. Each must sound like a real person, not a brand."""


@router.post("/generate")
def generate_campaign(req: CampaignRequest):
    prompt = build_prompt(req)

    def call_groq() -> str:
        resp = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.8,
            max_tokens=4000,
        )
        return resp.choices[0].message.content or "{}"

    try:
        try:
            content = call_groq()
            logger.info("[Generate] Groq succeeded")
        except Exception as groq_err:
            if "rate_limit" in str(groq_err).lower() or "429" in str(groq_err):
                logger.warning("[Generate] Groq rate-limited, falling back to OpenRouter")
                content = openrouter_complete(prompt)
            else:
                raise

        data = json.loads(content)
        if "scripts" not in data:
            raise ValueError("Incomplete response — missing scripts")
        return data

    except Exception as e:
        logger.error(f"[Generate] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
