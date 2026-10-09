from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.application import ApplicationStatus


class CompanyBase(BaseModel):
    name: str
    website: Optional[str] = None
    location: Optional[str] = None


class CompanyOut(CompanyBase):
    id: int
    class Config:
        from_attributes = True


class ApplicationCreate(BaseModel):
    job_title: str
    job_description: Optional[str] = None
    status: ApplicationStatus = ApplicationStatus.saved
    source: Optional[str] = None
    salary_range: Optional[str] = None
    notes: Optional[str] = None
    company_name: Optional[str] = None


class ApplicationUpdate(BaseModel):
    job_title: Optional[str] = None
    job_description: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    source: Optional[str] = None
    salary_range: Optional[str] = None
    notes: Optional[str] = None


class ApplicationOut(BaseModel):
    id: int
    job_title: str
    job_description: Optional[str]
    status: ApplicationStatus
    source: Optional[str]
    salary_range: Optional[str]
    notes: Optional[str]
    applied_date: Optional[datetime]
    created_at: datetime
    company: Optional[CompanyOut] = None

    class Config:
        from_attributes = True