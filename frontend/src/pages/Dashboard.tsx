import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ArrowUpRight } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { applicationsService, type Application } from '../services/applications'

export default function Dashboard() {
  const { user } = useAuth()
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    applicationsService
      .list()
      .then(setApps)
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: apps.length,
    interview: apps.filter((a) => a.status === 'interview').length,
    offer: apps.filter((a) => a.status === 'offer').length,
    rejected: apps.filter((a) => a.status === 'rejected').length,
  }

  const recent = apps.slice(0, 6)

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Welcome back, {user?.name}
          </p>
        </div>
        <Link to="/applications/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          New application
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <Stat label="Total" value={stats.total} />
        <Stat label="Interviewing" value={stats.interview} />
        <Stat label="Offers" value={stats.offer} />
        <Stat label="Rejected" value={stats.rejected} />
      </div>

      {/* Recent */}
      <div className="card">
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">
            Recent applications
          </h2>
          <Link
            to="/applications"
            className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
          >
            View all
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-zinc-500">
            Loading...
          </div>
        ) : recent.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-zinc-500 mb-3">No applications yet</p>
            <Link to="/applications/new" className="btn-secondary">
              <Plus className="w-4 h-4" />
              Add your first
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {recent.map((app) => (
              <Link
                key={app.id}
                to={`/applications/${app.id}`}
                className="px-5 py-3 flex items-center gap-4 hover:bg-zinc-50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">
                    {app.job_title}
                  </p>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    {app.company?.name || 'No company'}
                    {app.source && ` · ${app.source}`}
                  </p>
                </div>
                <StatusBadge status={app.status} />
                <span className="text-xs text-zinc-400 w-20 text-right">
                  {new Date(app.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card px-4 py-3">
      <p className="text-xs text-zinc-500 font-medium">{label}</p>
      <p className="text-2xl font-semibold text-zinc-900 mt-1 tabular-nums">
        {value}
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    saved: { label: 'Saved', className: 'bg-zinc-100 text-zinc-600' },
    applied: { label: 'Applied', className: 'bg-blue-50 text-blue-700' },
    interview: { label: 'Interview', className: 'bg-amber-50 text-amber-700' },
    offer: { label: 'Offer', className: 'bg-emerald-50 text-emerald-700' },
    rejected: { label: 'Rejected', className: 'bg-rose-50 text-rose-700' },
  }
  const s = map[status] || map.saved
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${s.className}`}
    >
      {s.label}
    </span>
  )
}