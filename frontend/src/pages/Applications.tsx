import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, X, ArrowUpDown } from 'lucide-react'
import Layout from '../components/Layout'
import {
  applicationsService,
  type Application,
  type ApplicationStatus,
} from '../services/applications'

const statusLabels: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
}

const statusColors: Record<ApplicationStatus, string> = {
  saved: 'bg-zinc-100 text-zinc-600',
  applied: 'bg-blue-50 text-blue-700',
  interview: 'bg-amber-50 text-amber-700',
  offer: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-rose-50 text-rose-700',
}

type SortKey = 'recent' | 'oldest' | 'title'

export default function Applications() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all')
  const [sort, setSort] = useState<SortKey>('recent')

  useEffect(() => {
    applicationsService
      .list()
      .then(setApps)
      .catch(() => setError('Failed to load applications'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let result = apps

    if (filter !== 'all') {
      result = result.filter((a) => a.status === filter)
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter((a) => {
        const inTitle = a.job_title.toLowerCase().includes(q)
        const inCompany = (a.company?.name || '').toLowerCase().includes(q)
        const inDesc = (a.job_description || '').toLowerCase().includes(q)
        return inTitle || inCompany || inDesc
      })
    }

    return [...result].sort((a, b) => {
      if (sort === 'recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      if (sort === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      return a.job_title.localeCompare(b.job_title)
    })
  }, [apps, query, filter, sort])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: apps.length }
    ;(Object.keys(statusLabels) as ApplicationStatus[]).forEach((s) => {
      c[s] = apps.filter((a) => a.status === s).length
    })
    return c
  }, [apps])

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Applications
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {apps.length} total
          </p>
        </div>
        <Link to="/applications/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          New application
        </Link>
      </div>

      {/* Search + Sort */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, company, or description..."
            className="input pl-9 pr-9"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-zinc-100"
            >
              <X className="w-3.5 h-3.5 text-zinc-500" />
            </button>
          )}
        </div>

        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="input pl-9 pr-8 appearance-none cursor-pointer min-w-[160px]"
          >
            <option value="recent">Most recent</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        <FilterPill
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label="All"
          count={counts.all}
        />
        {(Object.keys(statusLabels) as ApplicationStatus[]).map((s) => (
          <FilterPill
            key={s}
            active={filter === s}
            onClick={() => setFilter(s)}
            label={statusLabels[s]}
            count={counts[s]}
          />
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonTable />
      ) : error ? (
        <div className="card p-5 text-sm text-rose-600 bg-rose-50 border-rose-100">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          hasApps={apps.length > 0}
          onClear={() => {
            setQuery('')
            setFilter('all')
          }}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/50">
                <th className="text-left px-5 py-2.5 text-xs font-medium text-zinc-500">
                  Position
                </th>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-zinc-500">
                  Company
                </th>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-zinc-500">
                  Status
                </th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-zinc-500">
                  Added
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-zinc-50 transition-colors group"
                >
                  <td className="px-5 py-3">
                    <Link
                      to={`/applications/${app.id}`}
                      className="block"
                    >
                      <p className="text-sm font-medium text-zinc-900 group-hover:text-zinc-900">
                        {app.job_title}
                      </p>
                      {app.source && (
                        <p className="text-xs text-zinc-500 mt-0.5">
                          via {app.source}
                        </p>
                      )}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-zinc-600">
                    {app.company?.name || '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        statusColors[app.status]
                      }`}
                    >
                      {statusLabels[app.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-zinc-500">
                    {new Date(app.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}

function FilterPill({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
        active
          ? 'bg-zinc-900 text-white'
          : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900'
      }`}
    >
      {label}
      <span
        className={`tabular-nums ${
          active ? 'text-zinc-300' : 'text-zinc-400'
        }`}
      >
        {count}
      </span>
    </button>
  )
}

function SkeletonTable() {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-zinc-200 bg-zinc-50/50 px-5 py-2.5 flex gap-8">
        <div className="h-3 w-20 skeleton rounded" />
        <div className="h-3 w-20 skeleton rounded" />
        <div className="h-3 w-16 skeleton rounded" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="px-5 py-4 border-b border-zinc-100 flex items-center gap-6"
        >
          <div className="h-3 w-40 skeleton rounded" />
          <div className="h-3 w-24 skeleton rounded" />
          <div className="h-5 w-16 skeleton rounded" />
          <div className="h-3 w-20 skeleton rounded ml-auto" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({
  hasApps,
  onClear,
}: {
  hasApps: boolean
  onClear: () => void
}) {
  return (
    <div className="card py-16 px-6 text-center">
      <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 flex items-center justify-center mb-4">
        <Search className="w-5 h-5 text-zinc-400" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-900 mb-1">
        {hasApps ? 'No results found' : 'No applications yet'}
      </h3>
      <p className="text-sm text-zinc-500 mb-5 max-w-sm mx-auto">
        {hasApps
          ? 'Try adjusting your search or filter.'
          : 'Start tracking your job applications.'}
      </p>
      {hasApps ? (
        <button onClick={onClear} className="btn-secondary">
          Clear filters
        </button>
      ) : (
        <Link to="/applications/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          Add your first application
        </Link>
      )}
    </div>
  )
}