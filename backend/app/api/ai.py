from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from openai import OpenAI
import os
import json
import httpx
from dotenv import load_dotenv

from app.api.deps import get_current_user
from app.models.user import User

load_dotenv()

router = APIRouter(prefix="/api/ai", tags=["AI"])

# ═══════════════════════════════════════════
# Multiple AI providers (fallback chain)
# ═══════════════════════════════════════════

PROVIDERS = [
    {
        "name": "pollinations",
        "base_url": "https://text.pollinations.ai/openai",
        "api_key": "unused",
        "model": "openai",
    },
    {
        "name": "ovh",
        "base_url": "https://oai.endpoints.kepler.ai.cloud.ovh.net/v1",
        "api_key": "unused",
        "model": "Meta-Llama-3_3-70B-Instruct",
    },
    {
        "name": "llm7",
        "base_url": "https://api.llm7.io/v1",
        "api_key": "unused",
        "model": "fast",
    },
]


def ask_ai(prompt: str, json_mode: bool = False, max_tokens: int = 1500) -> str:
    """Try each provider until one succeeds."""
    last_error = "No providers available"

    for provider in PROVIDERS:
        try:
            client = OpenAI(
                base_url=provider["base_url"],
                api_key=provider["api_key"],
                timeout=httpx.Timeout(45.0, connect=15.0),
            )

            kwargs = {
                "model": provider["model"],
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are a JSON-only API. Return only valid JSON."
                            if json_mode
                            else "You are an expert career coach."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.3 if json_mode else 0.7,
                "max_tokens": max_tokens,
            }
            if json_mode:
                kwargs["response_format"] = {"type": "json_object"}

            completion = client.chat.completions.create(**kwargs)
            content = completion.choices[0].message.content.strip()
            print(f"[AI] Success with provider: {provider['name']}")
            return content

        except Exception as e:
            print(f"[AI] Provider {provider['name']} failed: {str(e)[:200]}")
            last_error = str(e)
            continue

    raise HTTPException(500, f"All AI providers failed. Last error: {last_error[:200]}")


# ═══════════════════════════════════════════
# Schemas
# ═══════════════════════════════════════════

class ParseJobRequest(BaseModel):
    job_description: str


class ParsedJob(BaseModel):
    skills: list[str]
    years_experience: Optional[str] = None
    role_level: Optional[str] = None
    ats_keywords: list[str]
    summary: str


class CoverLetterRequest(BaseModel):
    job_title: str
    company_name: str
    job_description: str
    user_name: str
    user_background: str


class CoverLetterResponse(BaseModel):
    cover_letter: str


class MatchRequest(BaseModel):
    resume: str
    job_description: str


class MatchResponse(BaseModel):
    match_score: int
    strengths: list[str]
    gaps: list[str]
    advice: str


# ═══════════════════════════════════════════
# 1. AI Job Parser
# ═══════════════════════════════════════════

@router.post("/parse-job", response_model=ParsedJob)
def parse_job(
    data: ParseJobRequest,
    current_user: User = Depends(get_current_user),
):
    if not data.job_description.strip():
        raise HTTPException(400, "Job description is required")

    prompt = f"""Analyze this job description and return ONLY valid JSON.

Job Description:
\"\"\"
{data.job_description[:3000]}
\"\"\"

Return JSON:
{{
  "skills": ["skill1", "skill2"],
  "years_experience": "3-5 years",
  "role_level": "mid",
  "ats_keywords": ["kw1", "kw2"],
  "summary": "One sentence summary"
}}

Rules:
- skills: top 8 technical skills
- years_experience: extract or infer
- role_level: intern | junior | mid | senior | lead
- ats_keywords: 10 keywords
- summary: 1 sentence"""

    content = ask_ai(prompt, json_mode=True)
    try:
        # strip markdown if present
        content = content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        return ParsedJob(**json.loads(content))
    except Exception as e:
        raise HTTPException(500, f"Invalid AI response: {content[:200]} ({e})")


# ═══════════════════════════════════════════
# 2. AI Cover Letter Generator
# ═══════════════════════════════════════════

@router.post("/cover-letter", response_model=CoverLetterResponse)
def cover_letter(
    data: CoverLetterRequest,
    current_user: User = Depends(get_current_user),
):
    prompt = f"""Write a professional cover letter.

Position: {data.job_title}
Company: {data.company_name}
Applicant: {data.user_name}

Job Description:
\"\"\"
{data.job_description[:2000]}
\"\"\"

Applicant Background:
\"\"\"
{data.user_background[:1000]}
\"\"\"

Requirements:
- Professional but warm tone
- 3-4 paragraphs, max 300 words
- Strong opening hook (not "I am writing to apply")
- Connect background to specific job requirements
- Clear call to action
- No clichés
- Return ONLY the cover letter text, no markdown, no headers"""

    text = ask_ai(prompt, json_mode=False, max_tokens=1000)
    return CoverLetterResponse(cover_letter=text)


# ═══════════════════════════════════════════
# 3. AI Resume Match Score
# ═══════════════════════════════════════════

@router.post("/match", response_model=MatchResponse)
def match_resume(
    data: MatchRequest,
    current_user: User = Depends(get_current_user),
):
    prompt = f"""Analyze how well this resume matches the job.

Resume:
\"\"\"
{data.resume[:2000]}
\"\"\"

Job Description:
\"\"\"
{data.job_description[:2000]}
\"\"\"

Return ONLY valid JSON:
{{
  "match_score": 75,
  "strengths": ["s1", "s2", "s3"],
  "gaps": ["g1", "g2"],
  "advice": "Specific actionable advice in 2-3 sentences"
}}

Rules:
- match_score: 0-100 integer
- strengths: 3-5 specific matching points
- gaps: 2-4 missing skills
- advice: actionable & encouraging"""

    content = ask_ai(prompt, json_mode=True)
    try:
        content = content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        return MatchResponse(**json.loads(content))
    except Exception as e:
        raise HTTPException(500, f"Invalid AI response: {content[:200]} ({e})")