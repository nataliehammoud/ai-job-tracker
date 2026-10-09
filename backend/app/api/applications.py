from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from collections import Counter
from typing import List

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.application import Application
from app.models.company import Company
from app.schemas.application import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationOut,
)

router = APIRouter(prefix="/api/applications", tags=["Applications"])


# ⚠️ مهم: هذا الـendpoint لازم يكون قبل /{app_id}
@router.get("/stats/overview")
def stats_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    apps = (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .all()
    )

    # Status breakdown
    by_status = {}
    for status in ["saved", "applied", "interview", "offer", "rejected"]:
        by_status[status] = len([a for a in apps if a.status.value == status])

    # Monthly counts (last 6 months)
    monthly = []
    now = datetime.now()
    for i in range(5, -1, -1):
        target = now - timedelta(days=i * 30)
        month_key = target.strftime("%Y-%m")
        month_label = target.strftime("%b")
        count = len([
            a for a in apps
            if a.created_at and a.created_at.strftime("%Y-%m") == month_key
        ])
        monthly.append({"month": month_label, "count": count})

    # Top companies
    company_counter = Counter([
        a.company.name for a in apps if a.company
    ])
    top_companies = [
        {"name": name, "count": count}
        for name, count in company_counter.most_common(5)
    ]

    # Response rate
    total = len(apps)
    interviews = by_status["interview"]
    offers = by_status["offer"]
    response_rate = (
        round(((interviews + offers) / total * 100), 1) if total > 0 else 0
    )

    return {
        "total": total,
        "by_status": by_status,
        "monthly": monthly,
        "top_companies": top_companies,
        "response_rate": response_rate,
    }


@router.get("", response_model=List[ApplicationOut])
def list_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .all()
    )


@router.post("", response_model=ApplicationOut, status_code=201)
def create_application(
    data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    company_id = None
    if data.company_name:
        company = db.query(Company).filter(Company.name == data.company_name).first()
        if not company:
            company = Company(name=data.company_name)
            db.add(company)
            db.commit()
            db.refresh(company)
        company_id = company.id

    payload = data.model_dump(exclude={"company_name"})
    app_obj = Application(**payload, user_id=current_user.id, company_id=company_id)
    db.add(app_obj)
    db.commit()
    db.refresh(app_obj)
    return app_obj


@router.get("/{app_id}", response_model=ApplicationOut)
def get_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    obj = (
        db.query(Application)
        .filter(
            Application.id == app_id,
            Application.user_id == current_user.id,
        )
        .first()
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Application not found")
    return obj


@router.put("/{app_id}", response_model=ApplicationOut)
def update_application(
    app_id: int,
    data: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    obj = (
        db.query(Application)
        .filter(
            Application.id == app_id,
            Application.user_id == current_user.id,
        )
        .first()
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Application not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)

    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{app_id}", status_code=204)
def delete_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    obj = (
        db.query(Application)
        .filter(
            Application.id == app_id,
            Application.user_id == current_user.id,
        )
        .first()
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(obj)
    db.commit()
    return None