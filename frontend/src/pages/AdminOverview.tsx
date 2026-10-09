import { useEffect, useState } from 'react'
import {
  Users,
  FileText,
  Building2,
  Layers,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react'
import Layout from '../components/Layout'
import { api } from '../services/api'

interface Stats {
  total_users: number
  total_applications: number
  total_companies: number
  by_status: { status: string; count: number }[]
}

interface MarketCluster {
  cluster_id: number
  label: string
  size: number
  avg_applications: number
  avg_success_rate: number
  top_location: string
}

interface DuplicatePair {
  user_id: number
  app_a: { id: number; job_title: string; company: string }
  app_b: { id: number; job_title: string; company: string }
  similarity: number
}

interface DuplicateReport {
  total_pairs: number
  pairs: DuplicatePair[]
}

// ═══ Status colors ═══
const STATUS_STYLES: Record<string, { bar: string; label: string }> = {
  saved: { bar: 'bg-zinc-400', label: 'Saved' },
  applied: { bar: 'bg-blue-500', label: 'Applied' },
  interview: { bar: 'bg-amber-500', label: 'Interview' },
  offer: { bar: 'bg-emerald-500', label: 'Offer' },
  rejected: { bar: 'bg-rose-500', label: 'Rejected' },
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [marketClusters, setMarketClusters] = useState<{
    clusters: MarketCluster[]
    n_clusters: number
    message: string
  } | null>(null)
  const [duplicateReport, setDuplicateReport] = useState<DuplicateReport | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get<Stats>('/api/admin/stats').then((r) => r.data),
      api
        .get('/api/admin/ml/clusters')
        .then((r) => r.data)
        .catch(() => null),
      api
        .get('/api/admin/ml/duplicate-report')
        .then((r) => r.data)
        .catch(() => null),
    ])
      .then(([s, c, d]) => {
        setStats(s)
        setMarketClusters(c)
        setDuplicateReport(d)
      })
      .catch(() => setError('Failed to load stats'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
                Admin Overview
              </h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                نظرة عامة على المنصة
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card p-12 text-center text-sm text-zinc-500">
            Loading...
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
        ) : stats ? (
          <>
            {/* ═══ Stats Cards ═══ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <StatCard
                label="Total Users"
                value={stats.total_users}
                icon={Users}
                color="blue"
              />
              <StatCard
                label="Total Applications"
                value={stats.total_applications}
                icon={FileText}
                color="emerald"
              />
              <StatCard
                label="Total Companies"
                value={stats.total_companies}
                icon={Building2}
                color="purple"
              />
            </div>

            {/* ═══ Applications by Status ═══ */}
            <div className="card p-6 mb-8">
              <div className="flex items-center gap-2 mb-5">
                <FileText className="w-4 h-4 text-zinc-500" />
                <h2 className="text-sm font-semibold text-zinc-900">
                  Applications by Status
                </h2>
              </div>

              {stats.by_status.length === 0 ? (
                <p className="text-sm text-zinc-500">No applications yet</p>
              ) : (
                <div className="space-y-4">
                  {stats.by_status.map((item) => {
                    const style =
                      STATUS_STYLES[item.status] || STATUS_STYLES.saved
                    const pct =
                      stats.total_applications > 0
                        ? (item.count / stats.total_applications) * 100
                        : 0
                    return (
                      <div key={item.status} className="flex items-center gap-4">
                        <span className="w-24 text-sm font-medium text-zinc-700 capitalize">
                          {style.label}
                        </span>
                        <div className="flex-1 bg-zinc-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`${style.bar} h-full transition-all duration-500 rounded-full`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-16 text-right text-sm font-medium text-zinc-900 tabular-nums">
                          {item.count}
                        </span>
                        <span className="w-12 text-right text-xs text-zinc-400 tabular-nums">
                          {Math.round(pct)}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ═══ Market Clusters (K-Means) ═══ */}
            {marketClusters && marketClusters.clusters?.length > 0 && (
              <div className="card p-6 mb-8">
                <div className="flex items-center gap-3 mb-5">
                  <Layers className="w-4 h-4 text-zinc-500" />
                  <h2 className="text-sm font-semibold text-zinc-900">
                    Company Clusters
                  </h2>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium border border-purple-200">
                    K-Means
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mb-5">
                  {marketClusters.message}
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {marketClusters.clusters.map((c) => (
                    <div
                      key={c.cluster_id}
                      className="border border-zinc-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">
                            {c.label}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {c.top_location}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-md bg-zinc-100 text-zinc-700 font-medium">
                          {c.size} companies
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-zinc-500">
                            Avg Applications
                          </p>
                          <p className="text-base font-semibold text-zinc-900 tabular-nums">
                            {c.avg_applications}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">
                            Avg Success Rate
                          </p>
                          <p className="text-base font-semibold text-zinc-900 tabular-nums">
                            {Math.round(c.avg_success_rate * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ Duplicate Report (Levenshtein) ═══ */}
            {duplicateReport && duplicateReport.total_pairs > 0 && (
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-5">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <h2 className="text-sm font-semibold text-zinc-900">
                    Suspicious Duplicates
                  </h2>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-medium border border-rose-200">
                    Levenshtein
                  </span>
                  <span className="text-xs text-zinc-400">
                    {duplicateReport.total_pairs} pairs
                  </span>
                </div>
                <div className="space-y-2">
                  {duplicateReport.pairs.slice(0, 10).map((p, i) => (
                    <div
                      key={i}
                      className="text-xs bg-rose-50/50 border border-rose-200 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-rose-900">
                          User #{p.user_id}
                        </p>
                        <span className="text-rose-600 font-medium tabular-nums">
                          {p.similarity}% similar
                        </span>
                      </div>
                      <p className="text-rose-700 mt-1">
                        "{p.app_a.job_title}"
                        <span className="text-rose-400 mx-1.5">↔</span>"
                        {p.app_b.job_title}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </Layout>
  )
}

// ═══ StatCard ═══
function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: any
  color: 'blue' | 'emerald' | 'purple'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  }
  return (
    <div className={`p-5 rounded-lg border ${colors[color]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium opacity-80 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-3xl font-bold mt-2 tabular-nums">{value}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-white/60 flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  )
}