from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.models import user, company, application  # noqa
from app.api import auth, applications, admin, ai, ml, admin_ai

load_dotenv()

app = FastAPI(
    title="AI Job Tracker API",
    version="0.1.0",
    description="Backend for AI Job Application Tracker",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ml.router)
app.include_router(auth.router)
app.include_router(applications.router)
app.include_router(admin.router)
app.include_router(ai.router)
app.include_router(admin_ai.router)   # ← جديد


@app.get("/")
def root():
    return {"message": "AI Job Tracker API is running 🚀"}


@app.get("/health")
def health():
    return {"status": "ok"}