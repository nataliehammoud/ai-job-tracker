import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Any, Optional


def _label_cluster(avg_apps: float, avg_success: float) -> str:
    """اسم وصفي لكل cluster بناءً على centroid."""
    if avg_apps >= 4 and avg_success >= 0.5:
        return "⭐ Top Targets"
    if avg_apps >= 4:
        return "🔥 High Activity"
    if avg_success >= 0.5:
        return "🎯 High Success"
    return "💤 Low Activity"


def cluster_companies(
    companies: List[Dict[str, Any]],
    n_clusters: Optional[int] = None,
) -> Dict[str, Any]:
    """
    companies: list of dicts {id, name, location, applications_count, success_rate}
    """
    if len(companies) < 3:
        return {
            "clusters": [],
            "n_clusters": 0,
            "message": "Need at least 3 companies to cluster.",
        }

    if n_clusters is None:
        n_clusters = min(4, max(2, len(companies) // 3))

    # ═══ Features ═══
    locations = [c.get("location") or "Unknown" for c in companies]
    apps = np.array(
        [[c.get("applications_count", 0)] for c in companies], dtype=float
    )
    success = np.array(
        [[c.get("success_rate", 0.0)] for c in companies], dtype=float
    )

    unique_locs = sorted(set(locations))
    loc_matrix = np.zeros((len(companies), len(unique_locs)))
    for i, loc in enumerate(locations):
        loc_matrix[i, unique_locs.index(loc)] = 1

    X = np.hstack([loc_matrix, apps, success])

    # Scale الأعمدة الرقمية فقط
    scaler = StandardScaler()
    X[:, -2:] = scaler.fit_transform(X[:, -2:])

    # ═══ K-Means ═══
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X)

    result_clusters = []
    for cid in range(n_clusters):
        members = [
            companies[i] for i in range(len(companies)) if labels[i] == cid
        ]
        if not members:
            continue

        avg_apps = float(
            np.mean([m.get("applications_count", 0) for m in members])
        )
        avg_success = float(
            np.mean([m.get("success_rate", 0.0) for m in members])
        )

        top_loc = max(
            set(m.get("location") or "Unknown" for m in members),
            key=lambda l: sum(
                1 for m in members if (m.get("location") or "Unknown") == l
            ),
        )

        result_clusters.append({
            "cluster_id": int(cid),
            "label": _label_cluster(avg_apps, avg_success),
            "size": len(members),
            "avg_applications": round(avg_apps, 1),
            "avg_success_rate": round(avg_success, 2),
            "top_location": top_loc,
            "companies": [
                {
                    "id": m["id"],
                    "name": m["name"],
                    "location": m.get("location"),
                    "applications_count": m.get("applications_count", 0),
                }
                for m in members
            ],
        })

    # ترتيب: الأعلى نشاطًا أولاً
    result_clusters.sort(key=lambda c: -c["avg_applications"])

    return {
        "clusters": result_clusters,
        "n_clusters": len(result_clusters),
        "message": f"Grouped {len(companies)} companies into {len(result_clusters)} clusters.",
    }