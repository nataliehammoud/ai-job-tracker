from typing import Dict, Any, List, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from app.services.ml.training_data import TRAINING_DATA


# ═══ تدريب الموديل مرة واحدة عند تحميل الوحدة ═══
def _build_model() -> Pipeline:
    texts = [t[0] for t in TRAINING_DATA]
    labels = [t[1] for t in TRAINING_DATA]

    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words='english',
            sublinear_tf=True,
        )),
        ('nb', MultinomialNB(alpha=0.3)),
    ])
    pipeline.fit(texts, labels)
    return pipeline


_MODEL = _build_model()


# ═══ واجهة برمجية ═══
def predict_status(notes: str, top_k: int = 3) -> Dict[str, Any]:
    """
    Predicts application status from free-text notes.
    Returns: status, confidence, top_predictions, needs_review.
    """
    if not notes or not notes.strip():
        return {
            "status": None,
            "confidence": 0.0,
            "top_predictions": [],
            "needs_review": True,
            "message": "No text to analyze"
        }

    # Probabilities for each class
    probs = _MODEL.predict_proba([notes])[0]
    classes = _MODEL.classes_

    # Sort descending
    pairs = sorted(zip(classes, probs), key=lambda x: -x[1])
    top_preds = [
        {"status": s, "probability": round(float(p) * 100, 1)}
        for s, p in pairs[:top_k]
    ]

    best_status, best_prob = pairs[0]
    confidence = float(best_prob)

    # Confidence below 35% → needs human review
    needs_review = confidence < 0.35

    return {
        "status": best_status,
        "confidence": round(confidence * 100, 1),
        "top_predictions": top_preds,
        "needs_review": needs_review,
        "message": (
            "Low confidence — please verify manually"
            if needs_review
            else f"Predicted status: {best_status}"
        )
    }