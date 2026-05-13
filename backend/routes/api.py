import os
import re
import json
import logging
import httpx
from typing import Optional
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


# ── Helpers ───────────────────────────────────────────────────────────────────

def fetch_url_content(url: str) -> str:
    """Fetch a URL and return cleaned text content (first 2500 chars)."""
    try:
        resp = httpx.get(url, timeout=10, follow_redirects=True, headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        })
        text = re.sub(r'<script[^>]*>.*?</script>', ' ', resp.text, flags=re.DOTALL)
        text = re.sub(r'<style[^>]*>.*?</style>', ' ', text, flags=re.DOTALL)
        text = re.sub(r'<[^>]+>', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text[:2500]
    except Exception as e:
        logger.warning(f"URL fetch failed for {url}: {e}")
        return ""


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


def call_groq_json(prompt: str, max_tokens: int = 2000, temperature: float = 0.6) -> str:
    resp = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return resp.choices[0].message.content or "{}"


def llm_complete(prompt: str, max_tokens: int = 2000, temperature: float = 0.6) -> str:
    """Try Groq first, fall back to OpenRouter on rate limit."""
    try:
        return call_groq_json(prompt, max_tokens, temperature)
    except Exception as e:
        if "rate_limit" in str(e).lower() or "429" in str(e):
            logger.warning(f"Groq rate-limited, using OpenRouter")
            return openrouter_complete(prompt, max_tokens)
        raise


# ── Request models ─────────────────────────────────────────────────────────────

class CompanyOptionsRequest(BaseModel):
    name: str
    url: Optional[str] = None

class CompanyContextRequest(BaseModel):
    identifier: str
    name: str
    url: Optional[str] = None

class GenerateRequest(BaseModel):
    company: dict
    wizard_answers: dict
    number_of_scripts: int = 3

class RefineRequest(BaseModel):
    script: dict
    message: str
    company: dict
    campaign_context: str = ""


# ── POST /company-options ──────────────────────────────────────────────────────

@router.post("/company-options")
def get_company_options(req: CompanyOptionsRequest):
    url_content = fetch_url_content(req.url) if req.url else ""
    url_section = f"\n\nWebsite content:\n{url_content}" if url_content else ""

    prompt = f"""You are a company research assistant.

User typed: "{req.name}"{url_section}

Return 1-4 company or product matches. If the name unambiguously refers to one company, return just 1. If multiple could match, return 2-4.

Return ONLY valid JSON:
{{
  "options": [
    {{
      "identifier": "<exact company/product identifier>",
      "name": "<full official name>",
      "type": "<category: e.g. EdTech App, Consumer Banking, Food Delivery, Fintech>",
      "description": "<one sentence: what this company or product does>"
    }}
  ]
}}"""

    try:
        data = json.loads(llm_complete(prompt, max_tokens=500, temperature=0.3))
        return data
    except Exception as e:
        logger.error(f"[CompanyOptions] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── POST /company-context ──────────────────────────────────────────────────────

@router.post("/company-context")
def get_company_context(req: CompanyContextRequest):
    url_content = fetch_url_content(req.url) if req.url else ""
    url_section = f"\n\nWebsite content (use for specific product details and pricing):\n{url_content}" if url_content else ""

    prompt = f"""You are a UGC (User-Generated Content) campaign strategist.

Company/Product: {req.identifier} — {req.name}{url_section}

Build a personalized UGC campaign wizard for this company. The wizard guides a growth marketer through choosing campaign configuration to generate creator-ready scripts.

RULES:
- 3 to 5 steps total (fewer for simpler products, more for complex)
- Each step has exactly 2 fields
- Each field has 4-8 options
- Every option must be 100% specific to {req.name} — no generic terms
- Include emoji in option labels (e.g. "📱 Gen Z students learning their first language")
- The LAST step must have:
  - field id "platform": options for TikTok, Instagram Reels, YouTube Shorts, LinkedIn
  - field id "campaign_goal": 4-6 goals specific to {req.name}'s business

Return ONLY valid JSON:
{{
  "company": {{
    "identifier": "{req.identifier}",
    "name": "<official name>",
    "type": "<product category>",
    "description": "<2 sentences>",
    "usp": "<single strongest unique selling point — include a specific number or stat if possible>",
    "key_facts": ["<specific fact with stat>", "<specific fact>", "<specific fact>", "<specific fact>"]
  }},
  "wizard": {{
    "steps": [
      {{
        "id": "step1",
        "title": "<specific step title>",
        "fields": [
          {{
            "id": "<snake_case_field_id>",
            "label": "<field label>",
            "description": "<optional 1-sentence context>",
            "options": [
              {{"label": "<emoji label>", "value": "<value>"}},
              {{"label": "<emoji label>", "value": "<value>"}},
              {{"label": "<emoji label>", "value": "<value>"}},
              {{"label": "<emoji label>", "value": "<value>"}}
            ]
          }},
          {{
            "id": "<snake_case_field_id>",
            "label": "<field label>",
            "options": [
              {{"label": "<emoji label>", "value": "<value>"}},
              {{"label": "<emoji label>", "value": "<value>"}},
              {{"label": "<emoji label>", "value": "<value>"}},
              {{"label": "<emoji label>", "value": "<value>"}}
            ]
          }}
        ]
      }}
    ]
  }}
}}"""

    try:
        data = json.loads(llm_complete(prompt, max_tokens=2500, temperature=0.6))
        if "company" not in data or "wizard" not in data:
            raise ValueError("Incomplete response — missing company or wizard")
        return data
    except Exception as e:
        logger.error(f"[CompanyContext] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── POST /generate ─────────────────────────────────────────────────────────────

def build_dynamic_prompt(company: dict, wizard_answers: dict, num_scripts: int) -> str:
    name = company.get("name", "the company")
    type_ = company.get("type", "")
    usp = company.get("usp", "")
    key_facts = company.get("key_facts", [])

    facts_block = "\n".join([f"- {f}" for f in key_facts]) if key_facts else f"Use your best knowledge of {name}."
    answers_block = "\n".join([
        f"- {k.replace('_', ' ').title()}: {v}"
        for k, v in wizard_answers.items()
        if k != "number_of_scripts"
    ])

    return f"""You are a world-class UGC (user-generated content) campaign strategist.

Create {num_scripts} high-quality, platform-native UGC scripts for {name} ({type_}).

COMPANY USP: {usp}

KEY PRODUCT FACTS — use specific details from these in every script:
{facts_block}

CAMPAIGN CONFIGURATION:
{answers_block}

SCRIPT RULES:
1. Use SPECIFIC details from key facts — no vague claims (e.g. not "cheaper" — use the actual number)
2. Each script sounds like a REAL PERSON talking to their phone camera — not a brand ad
3. Each script takes a DISTINCT angle (Emotional, Savings, Speed, Educational, Relatable, FOMO, Controversial)
4. Hook works in under 2 seconds — lead with a specific fact, question, or personal story moment
5. Scene breakdowns are filmable — specific locations, props, what's on screen
6. Creator direction is specific: exact setting, lighting, energy, pacing
7. Platform-native: vertical video, hook-first

ALSO generate a creative_brief with overall production guidance for the whole campaign.

Return ONLY valid JSON:
{{
  "campaign_name": "<specific, memorable name for this {name} campaign>",
  "target_insight": "<2 sentences: psychological insight about this specific audience and why {name} solves their specific pain>",
  "creative_brief": {{
    "vibe": "<overall emotional tone and energy arc for the campaign>",
    "setup": "<specific filming location, lighting, time of day>",
    "props": ["<specific prop 1>", "<specific prop 2>", "<specific prop 3>"],
    "hook_ideas": ["<additional hook idea 1>", "<hook idea 2>", "<hook idea 3>", "<hook idea 4>"]
  }},
  "scripts": [
    {{
      "id": 1,
      "title": "<specific descriptive title>",
      "angle": "<Savings|Speed|Emotional|Relatable|Educational|FOMO|Controversial>",
      "hook": "<exact opening line — specific, not generic>",
      "script": "<full first-person script, 60-90 seconds spoken>",
      "scene_breakdown": ["<specific filmable scene 1>", "<scene 2>", "<scene 3>", "<scene 4>"],
      "cta": "<natural, non-salesy CTA>",
      "creator_direction": "<specific: setting, lighting, energy, delivery, what to show on screen>",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
      "estimated_duration": "<e.g. 45-60 seconds>",
      "emotion_trigger": "<fear|curiosity|relatability|aspiration|humor>"
    }}
  ],
  "experiment_plan": {{
    "hypothesis": "<specific, testable hypothesis>",
    "test_design": "<creators, split test structure, posting cadence>",
    "primary_metric": "<single most important metric>",
    "metrics": ["<metric 1>", "<metric 2>", "<metric 3>", "<metric 4>", "<metric 5>"],
    "winning_signal": "<specific threshold — e.g. >3% CTR>",
    "timeline": "<realistic milestones>"
  }}
}}

Generate exactly {num_scripts} scripts. Each must feel written by a real creator who genuinely uses {name}."""


@router.post("/generate")
def generate_campaign(req: GenerateRequest):
    prompt = build_dynamic_prompt(req.company, req.wizard_answers, req.number_of_scripts)
    try:
        content = llm_complete(prompt, max_tokens=4000, temperature=0.8)
        data = json.loads(content)
        if "scripts" not in data:
            raise ValueError("Incomplete response — missing scripts")
        return data
    except Exception as e:
        logger.error(f"[Generate] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── POST /refine ───────────────────────────────────────────────────────────────

@router.post("/refine")
def refine_script(req: RefineRequest):
    company_name = req.company.get("name", "the company")
    s = req.script

    prompt = f"""You are a UGC script editor for {company_name}.

CURRENT SCRIPT:
Title: {s.get('title')}
Angle: {s.get('angle')}
Hook: {s.get('hook')}
Script: {s.get('script')}
Scene Breakdown: {json.dumps(s.get('scene_breakdown', []))}
CTA: {s.get('cta')}
Creator Direction: {s.get('creator_direction')}
Hashtags: {json.dumps(s.get('hashtags', []))}
Duration: {s.get('estimated_duration')}
Emotion: {s.get('emotion_trigger')}

Campaign context: {req.campaign_context}

USER FEEDBACK: "{req.message}"

Refine this script based on the feedback. Keep what's working. Only change what the feedback targets.
Return the COMPLETE updated script as valid JSON with EXACTLY these fields:

{{
  "id": {s.get('id', 1)},
  "title": "...",
  "angle": "...",
  "hook": "...",
  "script": "...",
  "scene_breakdown": ["...", "...", "...", "..."],
  "cta": "...",
  "creator_direction": "...",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "estimated_duration": "...",
  "emotion_trigger": "..."
}}"""

    try:
        data = json.loads(llm_complete(prompt, max_tokens=1500, temperature=0.7))
        if "hook" not in data:
            raise ValueError("Invalid refined script response")
        return {"script": data}
    except Exception as e:
        logger.error(f"[Refine] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
