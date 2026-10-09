import { useEffect, useState } from 'react'
import { Search, Trash2, X } from 'lucide-react'
import Layout from '../components/Layout'
import {
  adminAppsService,
  type AdminApplication,
  type AdminApplicationDetail,
} from '../services/admin'
import { toast } from 'sonner'

export default function AdminApplications() {
  const [apps, setApps] = useState<AdminApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selected, setSelected] = useState<AdminApplicationDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const load = () => {
    setLoading(true)
    adminAppsService
      .list({
        status: statusFilter || undefined,
      })
      .then(setApps)
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const openDetail = async (id: number) => {
    setDetailLoading(true)
    setSelected({} as AdminApplicationDetail)
    try {
      const detail = await adminAppsService.get(id)
      setSelected(detail)
    } catch {
      toast.error('Failed to load details')
      setSelected(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this application? This cannot be undone.')) return
    try {
      await adminAppsService.remove(id)
      toast.success('Application deleted')
      setApps((prev) => prev.filter((a) => a.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch {
      toast.error('Failed to delete')
    }
  }

  const filtered = apps.filter((a) => {
    if (!search.trim()) return true
    const s = search.toLowerCase()
    return (
      a.job_title.toLowerCase().includes(s) ||
      a.company_name.toLowerCase().includes(s) ||
      a.user_name.toLowerCase().includes(s) ||
      a.user_email.toLowerCase().includes(s)
    )
  })

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Applications Management
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            View and manage all user applications
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by job, company, or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-44"
          >
            <option value="">All statuses</option>
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm text-zinc-500">
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-zinc-500">
              No applications found
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="w-16" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-zinc-50 cursor-pointer transition-colors"
                    onClick={() => openDetail(a.id)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-900">{a.user_name}</p>
                      <p className="text-xs text-zinc-500">{a.user_email}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{a.job_title}</td>
                    <td className="px-4 py-3 text-zinc-700">
                      {a.company_name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {a.created_at
                        ? new Date(a.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(a.id)
                        }}
                        className="p-1.5 rounded-md hover:bg-rose-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading ? (
              <div className="p-12 text-center text-sm text-zinc-500">
                Loading...
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-5 border-b border-zinc-200">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-900">
                      {selected.job_title}
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {selected.company_name || 'No company'} ·{' '}
                      {selected.user_name} ({selected.user_email})
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1.5 rounded-md hover:bg-zinc-100"
                  >
                    <X className="w-4 h-4 text-zinc-500" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoBlock label="Status" value={selected.status} />
                    <InfoBlock label="Source" value={selected.source || '—'} />
                    <InfoBlock
                      label="Salary"
                      value={selected.salary_range || '—'}
                    />
                    <InfoBlock
                      label="Applied Date"
                      value={
                        selected.applied_date
                          ? new Date(selected.applied_date).toLocaleDateString()
                          : '—'
                      }
                    />
                  </div>

                  {selected.job_description && (
                    <div>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
                        Job Description
                      </p>
                      <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed bg-zinc-50 rounded-lg p-3">
                        {selected.job_description}
                      </p>
                    </div>
                  )}

                  {selected.notes && (
                    <div>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
                        Notes
                      </p>
                      <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed bg-zinc-50 rounded-lg p-3">
                        {selected.notes}
                      </p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-zinc-200 flex justify-end">
                    <button
                      onClick={() => handleDelete(selected.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white text-sm hover:bg-rose-700 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Application
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
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

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-sm font-medium text-zinc-900 capitalize">{value}</p>
    </div>
  )
}