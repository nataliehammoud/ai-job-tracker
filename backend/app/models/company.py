from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.session import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    website = Column(String(255), nullable=True)
    location = Column(String(150), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())