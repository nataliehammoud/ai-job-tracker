from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.models.user import User
from app.models.application import Application
from app.db.session import get_db
from app.services.ml.matching import match_resume_to_job
from app.services.ml.classifier import predict_status
from app.services.ml.clustering import cluster_companies
from app.services.ml.duplicates import find_duplicates

router = APIRouter(prefix="/api/ml", tags=["ML"])


# ═══════════════════════════════════════════
# TF-IDF Match
# ═══════════════════════════════════════════

class MatchRequest(BaseModel):
    resume: str
    job_description: str


class MatchResponse(BaseModel):
    match_score: int
    strengths: List[str]
    gaps: List[str]
    advice: str


@router.post("/match", response_model=MatchResponse)
def match_resume(
    request: MatchRequest,
    current_user: User = Depends(get_current_user),
):
    if not request.resume.strip() or not request.job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Resume and job description are required",
        )
    return match_resume_to_job(request.resume, request.job_description)


# ═══════════════════════════════════════════
# Naive Bayes Classifier
# ═══════════════════════════════════════════

class ClassifyRequest(BaseModel):
    notes: str


class ClassifyResponse(BaseModel):
    status: str | None
    confidence: float
    top_predictions: List[dict]
    needs_review: bool
    message: str


@router.post("/classify-status", response_model=ClassifyResponse)
def classify_status(
    request: ClassifyRequest,
    current_user: User = Depends(get_current_user),
):
    if not request.notes.strip():
        raise HTTPException(status_code=400, detail="Notes are required")
    return predict_status(request.notes)


# ═══════════════════════════════════════════
# K-Means: My Clusters (User-scoped)
# ═══════════════════════════════════════════

@router.get("/clusters/me")
def my_clusters(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    apps = (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .all()
    )

    buckets: dict = {}
    for app in apps:
        if not app.company_id:
            continue
        c = app.company
        if not c:
            continue
        b = buckets.setdefault(app.company_id, {
            "id": c.id,
            "name": c.name,
            "location": c.location,
            "applications_count": 0,
            "success_count": 0,
        })
        b["applications_count"] += 1
        if app.status in ("interview", "offer"):
            b["success_count"] += 1

    companies = []
    for b in buckets.values():
        total = b["applications_count"]
        b["success_rate"] = b["success_count"] / total if total else 0.0
        companies.append(b)

    return cluster_companies(companies)


# ═══════════════════════════════════════════
# Levenshtein: Check Duplicate (User-scoped)
# ═══════════════════════════════════════════

class DuplicateCheckRequest(BaseModel):
    job_title: str
    company_name: str
    exclude_id: int | None = None


@router.post("/check-duplicate")
def check_duplicate(
    request: DuplicateCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    apps = (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .all()
    )

    candidates = [
        {
            "id": a.id,
            "job_title": a.job_title,
            "company_name": a.company.name if a.company else "",
            "status": a.status,
            "applied_date": a.applied_date.isoformat() if a.applied_date else None,
        }
        for a in apps
    ]

    matches = find_duplicates(
        {
            "id": request.exclude_id,
            "job_title": request.job_title,
            "company_name": request.company_name,
        },
        candidates,
        threshold=0.75,
    )

    return {
        "has_duplicates": len(matches) > 0,
        "count": len(matches),
        "matches": matches,
    }