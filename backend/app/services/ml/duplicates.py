from typing import List, Dict, Any


def _levenshtein(s1: str, s2: str) -> int:
    """مسافة Levenshtein (خوارزمية برمجة ديناميكية كلاسيكية)."""
    if len(s1) < len(s2):
        return _levenshtein(s2, s1)
    if not s2:
        return len(s1)

    prev = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        curr = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = prev[j + 1] + 1
            deletions = curr[j] + 1
            substitutions = prev[j] + (c1 != c2)
            curr.append(min(insertions, deletions, substitutions))
        prev = curr
    return prev[-1]


def _char_similarity(a: str, b: str) -> float:
    a, b = a.lower().strip(), b.lower().strip()
    if not a and not b:
        return 1.0
    if not a or not b:
        return 0.0
    max_len = max(len(a), len(b))
    if max_len == 0:
        return 1.0
    return 1 - _levenshtein(a, b) / max_len


def _token_similarity(a: str, b: str) -> float:
    ta = set(a.lower().split())
    tb = set(b.lower().split())
    if not ta and not tb:
        return 1.0
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / len(ta | tb)


def combined_similarity(a: str, b: str) -> float:
    """يجمع بين Levenshtein (حرفي) + Jaccard (كلمات)."""
    return round(0.5 * _char_similarity(a, b) + 0.5 * _token_similarity(a, b), 3)


def find_duplicates(
    target: Dict[str, Any],
    candidates: List[Dict[str, Any]],
    threshold: float = 0.75,
) -> List[Dict[str, Any]]:
    """
    target: {id?, job_title, company_name}
    candidates: list of same shape
    returns: list of matched candidates with similarity score
    """
    t_title = (target.get("job_title") or "").strip()
    t_company = (target.get("company_name") or "").strip()

    if not t_title or not t_company:
        return []

    matches = []
    for c in candidates:
        if target.get("id") and c.get("id") == target["id"]:
            continue  # تجاهل نفس الطلب

        title_sim = combined_similarity(t_title, c.get("job_title") or "")
        company_sim = combined_similarity(t_company, c.get("company_name") or "")

        # الوزن: العنوان 60% + الشركة 40%
        score = 0.6 * title_sim + 0.4 * company_sim

        if score >= threshold:
            matches.append({
                "id": c.get("id"),
                "job_title": c.get("job_title"),
                "company_name": c.get("company_name"),
                "status": c.get("status"),
                "applied_date": c.get("applied_date"),
                "similarity": round(score * 100, 1),
            })

    matches.sort(key=lambda m: -m["similarity"])
    return matches[:5]