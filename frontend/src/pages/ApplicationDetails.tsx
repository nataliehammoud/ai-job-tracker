import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import Layout from '../components/Layout'
import {
  applicationsService,
  type Application,
  type ApplicationStatus,
} from '../services/applications'

const statusColors: Record<ApplicationStatus, string> = {
  saved: 'bg-zinc-100 text-zinc-700',
  applied: 'bg-blue-50 text-blue-700',
  interview: 'bg-amber-50 text-amber-700',
  offer: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-rose-50 text-rose-700',
}

export default function ApplicationDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [app, setApp] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    applicationsService
      .get(Number(id))
      .then(setApp)
      .catch(() => setError('Application not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this application? This cannot be undone.')) return
    try {
      await applicationsService.remove(Number(id))
      navigate('/applications')
    } catch {
      setError('Failed to delete')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-zinc-500">Loading...</div>
      </Layout>
    )
  }

  if (error || !app) {
    return (
      <Layout>
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error || 'Not found'}
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            to="/applications"
            className="text-sm text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Applications
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
                {app.job_title}
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                {app.company?.name || 'No company'}
                {app.source && ` · via ${app.source}`}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize ${
                statusColors[app.status]
              }`}
            >
              {app.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-zinc-200">
            <Info label="Salary" value={app.salary_range || '—'} />
            <Info
              label="Created"
              value={new Date(app.created_at).toLocaleDateString()}
            />
          </div>

          {app.job_description && (
            <Section title="Job Description">
              <p className="whitespace-pre-wrap text-sm text-zinc-700 leading-relaxed">
                {app.job_description}
              </p>
            </Section>
          )}

          {app.notes && (
            <Section title="Notes">
              <p className="whitespace-pre-wrap text-sm text-zinc-700 leading-relaxed">
                {app.notes}
              </p>
            </Section>
          )}

          <div className="flex gap-3 pt-6 mt-6 border-t border-zinc-200">
            <Link
              to={`/applications/${app.id}/edit`}
              className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition text-sm font-medium"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 px-4 py-2 rounded-lg hover:bg-rose-100 transition text-sm font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm text-zinc-900 mt-1">{value}</p>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-6">
      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
        {title}
      </h2>
      {children}
    </div>
  )
}