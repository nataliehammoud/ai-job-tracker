# AI Job Tracker

> A full-stack job application tracker with AI-powered analysis and classical machine learning for smart job search management.

![Status](https://img.shields.io/badge/status-active-success)
![Python](https://img.shields.io/badge/Python-3.14-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.142-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.9-F7931E?logo=scikit-learn&logoColor=white)

---

## 📌 Overview

AI Job Tracker helps job seekers organize applications, track progress, and make smarter decisions using AI and machine learning. Unlike spreadsheets, it provides:

- **AI-powered** cover letter generation and job analysis
- **Classical ML** for resume matching, status prediction, and duplicate detection
- **K-Means clustering** for discovering patterns in your target companies
- **Role-based access** — separate tools for users and platform admins

---

## ✨ Features

### 👤 For Users

| Feature | Description |
|---------|-------------|
| **Application Tracking** | Full CRUD with search, filter, sort |
| **Analytics Dashboard** | Visual charts for status distribution and progress |
| **AI Cover Letter** | Generate tailored cover letters using LLM |
| **Match Score (AI + ML)** | Compare resume to job with both LLM and TF-IDF |
| **Auto Status (Naive Bayes)** | Predict application status from free-text notes |
| **Auto Job Analysis** | AI extracts skills, level, and ATS keywords from job descriptions |
| **Duplicate Detection (Levenshtein)** | Warns about similar applications before saving |

### 👑 For Admins

| Feature | Description |
|---------|-------------|
| **Platform Overview** | Stats, status breakdown, and health metrics |
| **Applications Management** | View, search, and moderate all user applications |
| **User Management** | Role control, account deletion |
| **Market Clusters (K-Means)** | Discover company segments across the platform |
| **Duplicate Report** | Detect spam patterns across users |
| **Admin AI Assistant** | Weekly reports + trend analysis via LLM |

---

## 🧠 Machine Learning Algorithms

Four classical ML algorithms implemented from scratch using `scikit-learn`:

### 1. TF-IDF + Cosine Similarity (Resume ↔ Job Matching)
- **Hybrid score**: `0.3 × Cosine Similarity + 0.7 × Jaccard Overlap`
- Extracts top strengths and gaps between resume and job description
- Runs locally, deterministic, and fast — no external API needed

### 2. Naive Bayes Classifier (Status Prediction)
- Trained on 60+ labeled examples of application notes
- Predicts status (`saved`, `applied`, `interview`, `offer`, `rejected`)
- Returns confidence score + top 3 predictions
- Includes a `needs_review` flag when confidence < 35%

### 3. K-Means Clustering (Company Segmentation)
- Groups companies by activity, location, and success rate
- Auto-labeled clusters: `Top Targets`, `High Activity`, `High Success`, `Low Activity`
- Used at platform-wide scale for admins

### 4. Levenshtein Distance (Duplicate Detection)
- Combined character-level + token-level similarity
- Detects duplicate or near-duplicate applications
- Weighted: 60% job title + 40% company name

---

## 🛠 Tech Stack

### Backend
- **FastAPI** — modern async Python framework
- **SQLAlchemy** — ORM
- **MySQL** — database
- **PyMySQL** — MySQL driver
- **JWT** — authentication (`python-jose`)
- **bcrypt** — password hashing
- **scikit-learn** — ML algorithms
- **OpenAI SDK** — LLM integration (3-provider fallback chain)

### Frontend
- **React 19** + **TypeScript**
- **Vite** — build tool
- **Tailwind CSS** — styling
- **React Router DOM** — routing
- **Axios** — HTTP client
- **Lucide Icons** — icons
- **Recharts** — charts
- **Sonner** — toast notifications

### LLM Providers (Fallback Chain)
1. **Pollinations** (`text.pollinations.ai`)
2. **OVHcloud AI Endpoints** (Meta-Llama-3.3-70B)
3. **LLM7** (`api.llm7.io`)

---

## 🏗 Architecture

```
┌────────────────────────────────────────────────┐
│                  Frontend                       │
│  React + TypeScript + Tailwind (port 5173)      │
└──────────────────┬─────────────────────────────┘
                   │  HTTP / JWT
                   ▼
┌────────────────────────────────────────────────┐
│                  Backend                        │
│  FastAPI + SQLAlchemy (port 8000)               │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐             │
│  │  AI Layer    │  │   ML Layer   │             │
│  │  (LLM APIs)  │  │  (sklearn)   │             │
│  └──────────────┘  └──────────────┘             │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────┐
│              MySQL Database                     │
│        users  ·  applications  ·  companies     │
└────────────────────────────────────────────────┘
```

---

## 🚀 Setup

### Prerequisites
- Python 3.14+
- Node.js 20+
- MySQL 8 (via XAMPP or standalone)

### 1. Clone the repo
```bash
git clone https://github.com/nataliehammoud/ai-job-tracker.git
cd ai-job-tracker
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` in `backend/`:
```env
DATABASE_URL=mysql+pymysql://root:@127.0.0.1:3307/ai_job_tracker
SECRET_KEY=your-long-random-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Create the database in MySQL:
```sql
CREATE DATABASE ai_job_tracker CHARACTER SET utf8mb4;
```

Run the backend:
```bash
uvicorn app.main:app --reload
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
npm run dev
```

---

## 🎯 Design Decisions

### Why only 3 database tables?
`users`, `applications`, `companies` — this is **intentional**, not a limitation. Real job trackers (Huntr, Teal, Simplify) use similar schemas. Adding more tables would be over-engineering for the problem domain.

### Why both LLM and classical ML?
They solve **different problems**:

| Task | Tool | Reason |
|------|------|--------|
| Understand & generate text | **LLM** | Natural language tasks |
| Match/classify/cluster | **ML** | Deterministic, fast, private, free |

The LLM is slow, non-deterministic, and costs API quota. Classical ML runs in milliseconds, is 100% deterministic, and works entirely offline.

### Why Naive Bayes instead of LLM for status classification?
- **Deterministic** — same input → same output
- **Instant** — no network round-trip
- **Explainable** — you can inspect the model's probabilities
- **Free** — no API quota consumed

### Why does the admin not have cover letter tools?
Because the admin's role is **oversight**, not job-seeking. Admin tools focus on platform analytics, spam detection, and LLM-powered reports.

---

## 📊 Project Stats

- **~75 files** across frontend + backend
- **4 ML algorithms** implemented
- **3 LLM providers** with automatic fallback
- **3 database tables** with proper normalization
- **2 user roles** with distinct feature sets
- **11 pages** in the frontend

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👩‍💻 Author

**Natalie Hammoud**
- GitHub: [@nataliehammoud](https://github.com/nataliehammoud)

---

⭐ If you found this project useful, consider giving it a star!