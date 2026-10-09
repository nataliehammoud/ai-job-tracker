import re
from typing import Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# Words that don't help matching
CUSTOM_STOPWORDS = {
    "looking", "required", "require", "requires", "strong", "bonus",
    "skills", "skill", "experience", "experienced", "years", "year",
    "work", "working", "team", "join", "role", "position", "job",
    "candidate", "applicant", "ability", "able", "knowledge",
    "understanding", "plus", "nice", "preferred", "must", "have",
    "has", "good", "great", "excellent", "well", "also", "using",
    "use", "used", "new", "other", "including", "include",
    "responsibilities", "requirements", "qualifications", "offer",
    "company", "opportunity", "you", "your", "our", "we", "will",
    "be", "is", "are", "and", "or", "the", "a", "an", "to", "of",
    "in", "on", "with", "for", "at", "by", "as", "from", "about",
    "developer", "engineer", "specialist", "manager", "senior",
    "junior", "mid", "lead", "intern", "internship",
    "english", "arabic", "communication", "written", "verbal",
}


def preprocess_text(text: str) -> str:
    """Clean text and handle dotted abbreviations."""
    text = text.lower()
    # node.js -> nodejs
    text = re.sub(r'\.(?=[a-z])', '', text)
    # replace symbols with space
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def _keep(name: str) -> bool:
    """Check if term is useful (not a stopword)."""
    return not any(t in CUSTOM_STOPWORDS for t in name.split())


def _sort_by_weight(terms, vec, feature_names):
    """Sort terms by TF-IDF weight descending."""
    weights = {feature_names[i]: vec[i] for i in range(len(feature_names))}
    return sorted(terms, key=lambda x: -weights.get(x, 0))


def match_resume_to_job(resume: str, job_description: str) -> Dict[str, Any]:
    """
    Match resume to job description.
    Hybrid Score = 0.3 * Cosine Similarity + 0.7 * Jaccard Overlap.
    """
    if not resume.strip() or not job_description.strip():
        return {
            "match_score": 0,
            "strengths": [],
            "gaps": [],
            "advice": "Please provide both a resume and a job description.",
        }

    resume_clean = preprocess_text(resume)
    job_clean = preprocess_text(job_description)

    # TF-IDF with n-grams (1,2)
    vectorizer = TfidfVectorizer(
        stop_words='english',
        ngram_range=(1, 2),
        sublinear_tf=True,
    )
    tfidf = vectorizer.fit_transform([resume_clean, job_clean])

    # Cosine Similarity
    cosine = float(cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0])

    # Extract features
    feature_names = vectorizer.get_feature_names_out()
    r_vec = tfidf[0].toarray()[0]
    j_vec = tfidf[1].toarray()[0]

    # Keywords in each text (after stopword filtering)
    resume_kw = {
        feature_names[i]
        for i in range(len(feature_names))
        if r_vec[i] > 0 and _keep(feature_names[i])
    }
    job_kw = {
        feature_names[i]
        for i in range(len(feature_names))
        if j_vec[i] > 0 and _keep(feature_names[i])
    }

    common_all = resume_kw & job_kw
    missing_all = job_kw - resume_kw

    # Jaccard: coverage of job requirements
    jaccard = len(common_all) / len(job_kw) if job_kw else 0.0

    # Hybrid Score
    match_score = round((0.3 * cosine + 0.7 * jaccard) * 100)
    match_score = max(0, min(100, match_score))

    # Show unigrams only (no duplicate n-grams)
    common_uni = {t for t in common_all if ' ' not in t}
    missing_uni = {t for t in missing_all if ' ' not in t}

    # Sort by weight
    combined_weight = r_vec + j_vec
    strengths = _sort_by_weight(common_uni, combined_weight, feature_names)[:10]
    gaps = _sort_by_weight(missing_uni, j_vec, feature_names)[:10]

    # Advice
    if match_score >= 70:
        advice = "Excellent match! Highlight your strengths and apply with confidence."
    elif match_score >= 50:
        advice = "Good match. Add the missing keywords to your resume."
    elif match_score >= 30:
        advice = "Moderate match. Focus on the missing skills or highlight transferable experience."
    else:
        advice = "Low match. Build additional skills or target roles closer to your experience."

    return {
        "match_score": match_score,
        "strengths": strengths,
        "gaps": gaps,
        "advice": advice,
    }