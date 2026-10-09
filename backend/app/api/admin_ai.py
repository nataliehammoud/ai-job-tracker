from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.api.deps import require_admin
from app.models.user import User
from app.models.application import Application
from app.models.company import Company
from app.api.ai import ask_ai

router = APIRouter(prefix="/api/admin/ai", tags=["Admin AI"])


# ═══════════════════════════════════════════
# Schemas
# ═══════════════════════════════════════════

class TrendRequest(BaseModel):
    question: str


class TrendResponse(BaseModel):
    answer: str


class ReportResponse(BaseModel):
    report: str


# ═══════════════════════════════════════════
# Helper: build platform context
# ═══════════════════════════════════════════

def _build_platform_context(db: Session) -> str:
    total_users = db.query(User).count()
    total_apps = db.query(Application).count()
    total_companies = db.query(Company).count()

    by_status = (
        db.query(Application.status, func.count(Application.id))
        .group_by(Application.status)
        .all()
    )

    top_companies = (
        db.query(Company.name, func.count(Application.id).label("cnt"))
        .join(Application, Application.company_id == Company.id)
        .group_by(Company.id)
        .order_by(func.count(Application.id).desc())
        .limit(5)
        .all()
    )

    status_lines = "\n".join(
        f"- {s.value if hasattr(s, 'value') else str(s)}: {c}"
        for s, c in by_status
    )
    company_lines = "\n".join(f"- {n}: {c} apps" for n, c in top_companies)

    return f"""Platform Statistics:
- Total Users: {total_users}
- Total Applications: {total_apps}
- Total Companies: {total_companies}

Applications by Status:
{status_lines or '- no data'}

Top Companies (by applications):
{company_lines or '- no data'}
"""


# ═══════════════════════════════════════════
# 1. Weekly Report
# ═══════════════════════════════════════════

@router.post("/weekly-report", response_model=ReportResponse)
def weekly_report(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """LLM writes a weekly platform report based on real stats."""
    context = _build_platform_context(db)

    prompt = f"""You are a platform analyst for a job-tracking SaaS.

{context}

Write a concise weekly report in English (max 200 words).

Format:
1. A short title starting with "Weekly Report —"
2. 3-4 bullet points summarizing key numbers
3. A section "Key Insight:" with ONE actionable observation

Rules:
- Be specific with numbers from the context
- Do NOT invent data
- Professional tone, no emojis
- Return ONLY the report text, no markdown fences"""

    report = ask_ai(prompt, json_mode=False, max_tokens=600)
    return ReportResponse(report=report)


# ═══════════════════════════════════════════
# 2. Trend Analysis (natural language Q&A)
# ═══════════════════════════════════════════

@router.post("/trend", response_model=TrendResponse)
def trend_analysis(
    data: TrendRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin asks a question — LLM answers using platform data."""
    if not data.question.strip():
        raise HTTPException(400, "Question is required")

    context = _build_platform_context(db)

    prompt = f"""You are a data analyst for a job-tracking platform.

{context}

Admin question: "{data.question}"

Rules:
- Answer concisely (max 120 words)
- Use ONLY the data above
- If the data is insufficient to answer, say so honestly
- Do NOT invent numbers
- Return ONLY the answer text, no markdown fences"""

    answer = ask_ai(prompt, json_mode=False, max_tokens=400)
    return TrendResponse(answer=answer)