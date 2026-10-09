from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.db.session import get_db
from app.api.deps import require_admin
from app.models.user import User, UserRole
from app.models.application import Application
from app.models.company import Company
from app.schemas.user import UserOut
from app.services.ml.clustering import cluster_companies
from app.services.ml.duplicates import combined_similarity

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ═══════════════════════════════════════════
# Stats
# ═══════════════════════════════════════════

@router.get("/stats")
def get_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    total_users = db.query(User).count()
    total_applications = db.query(Application).count()
    total_companies = db.query(Company).count()

    by_status = (
        db.query(Application.status, func.count(Application.id))
        .group_by(Application.status)
        .all()
    )

    return {
        "total_users": total_users,
        "total_applications": total_applications,
        "total_companies": total_companies,
        "by_status": [
            {"status": s.value if hasattr(s, "value") else str(s), "count": c}
            for s, c in by_status
        ],
    }


# ═══════════════════════════════════════════
# Users Management
# ═══════════════════════════════════════════

@router.get("/users", response_model=List[UserOut])
def list_users(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return db.query(User).order_by(User.id).all()


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: UserRole,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = role
    db.commit()
    db.refresh(user)
    return {"id": user.id, "role": user.role}


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return None


# ═══════════════════════════════════════════
# Applications Management (Admin)
# ═══════════════════════════════════════════

@router.get("/applications")
def list_all_applications(
    user_id: Optional[int] = None,
    status: Optional[str] = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """كل طلبات المنصة — مع فلترة اختيارية."""
    q = db.query(Application)
    if user_id:
        q = q.filter(Application.user_id == user_id)
    if status:
        q = q.filter(Application.status == status)

    apps = q.order_by(Application.created_at.desc()).all()

    return [
        {
            "id": a.id,
            "user_id": a.user_id,
            "user_name": a.user.name if a.user else "Unknown",
            "user_email": a.user.email if a.user else "Unknown",
            "job_title": a.job_title,
            "company_name": a.company.name if a.company else "",
            "status": a.status.value if hasattr(a.status, "value") else str(a.status),
            "source": a.source,
            "salary_range": a.salary_range,
            "applied_date": a.applied_date.isoformat() if a.applied_date else None,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in apps
    ]


@router.get("/applications/{app_id}")
def get_application_detail(
    app_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """تفاصيل أي طلب — للأدمن فقط."""
    a = db.query(Application).filter(Application.id == app_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Application not found")

    return {
        "id": a.id,
        "user_id": a.user_id,
        "user_name": a.user.name if a.user else "Unknown",
        "user_email": a.user.email if a.user else "Unknown",
        "job_title": a.job_title,
        "job_description": a.job_description,
        "company_name": a.company.name if a.company else "",
        "status": a.status.value if hasattr(a.status, "value") else str(a.status),
        "source": a.source,
        "salary_range": a.salary_range,
        "notes": a.notes,
        "applied_date": a.applied_date.isoformat() if a.applied_date else None,
        "created_at": a.created_at.isoformat() if a.created_at else None,
        "updated_at": a.updated_at.isoformat() if a.updated_at else None,
    }


@router.delete("/applications/{app_id}")
def delete_application_admin(
    app_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """حذف أي طلب — للإشراف."""
    a = db.query(Application).filter(Application.id == app_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(a)
    db.commit()
    return {"message": "Application deleted", "id": app_id}


# ═══════════════════════════════════════════
# Market-wide Clusters (K-Means)
# ═══════════════════════════════════════════

@router.get("/ml/clusters")
def market_clusters(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """K-Means على كل الشركات في المنصة."""
    rows = (
        db.query(
            Company.id,
            Company.name,
            Company.location,
            func.count(Application.id).label("apps_count"),
        )
        .outerjoin(Application, Application.company_id == Company.id)
        .group_by(Company.id)
        .all()
    )

    companies = []
    for r in rows:
        total = r.apps_count or 0
        success = 0
        if total > 0:
            success = (
                db.query(func.count(Application.id))
                .filter(
                    Application.company_id == r.id,
                    Application.status.in_(["interview", "offer"]),
                )
                .scalar()
                or 0
            )
        companies.append({
            "id": r.id,
            "name": r.name,
            "location": r.location,
            "applications_count": total,
            "success_rate": success / total if total else 0.0,
        })

    return cluster_companies(companies)


# ═══════════════════════════════════════════
# Duplicate Report (Levenshtein)
# ═══════════════════════════════════════════

@router.get("/ml/duplicate-report")
def duplicate_report(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """يكشف أزواج الطلبات المتشابهة جدًا (نفس المستخدم)."""
    apps = db.query(Application).all()

    by_user: dict = {}
    for a in apps:
        by_user.setdefault(a.user_id, []).append(a)

    suspicious = []
    for uid, user_apps in by_user.items():
        for i in range(len(user_apps)):
            for j in range(i + 1, len(user_apps)):
                a, b = user_apps[i], user_apps[j]
                t_sim = combined_similarity(a.job_title or "", b.job_title or "")
                c_sim = combined_similarity(
                    a.company.name if a.company else "",
                    b.company.name if b.company else "",
                )
                score = 0.6 * t_sim + 0.4 * c_sim
                if score >= 0.85:
                    suspicious.append({
                        "user_id": uid,
                        "app_a": {
                            "id": a.id,
                            "job_title": a.job_title,
                            "company": a.company.name if a.company else "",
                        },
                        "app_b": {
                            "id": b.id,
                            "job_title": b.job_title,
                            "company": b.company.name if b.company else "",
                        },
                        "similarity": round(score * 100, 1),
                    })

    suspicious.sort(key=lambda x: -x["similarity"])

    return {
        "total_pairs": len(suspicious),
        "pairs": suspicious[:20],
    }