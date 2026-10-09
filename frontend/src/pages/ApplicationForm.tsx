import { FormEvent, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { mlService } from '../services/ml'
import { aiService, type ParsedJob } from '../services/ai'
import { Wand2, AlertTriangle, Sparkles, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import {
  applicationsService,
  type ApplicationStatus,
  type ApplicationCreate,
} from '../services/applications'

const statusOptions: { value: ApplicationStatus; label: string }[] = [
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
]

// ═══ Debounce hook ═══
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function ApplicationForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [form, setForm] = useState<ApplicationCreate>({
    job_title: '',
    job_description: '',
    status: 'saved',
    company_name: '',
    source: '',
    salary_range: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEdit)
  const [error, setError] = useState('')

  // ═══ ML: Naive Bayes suggestion ═══
  const [mlSuggestion, setMlSuggestion] = useState<{
    status: string
    confidence: number
  } | null>(null)

  // ═══ ML: Duplicate warning (Levenshtein) ═══
  const [duplicateWarn, setDuplicateWarn] = useState<{
    count: number
    matches: {
      id: number
      job_title: string
      company_name: string
      similarity: number
    }[]
  } | null>(null)

  // ═══ AI: Job analysis ═══
  const [jobAnalysis, setJobAnalysis] = useState<ParsedJob | null>(null)
  const [analyzingJob, setAnalyzingJob] = useState(false)

  // ═══ Debounces ═══
  const debouncedNotes = useDebounce(form.notes || '', 800)
  const debouncedTitle = useDebounce(form.job_title || '', 700)
  const debouncedCompany = useDebounce(form.company_name || '', 700)
  const debouncedJobDesc = useDebounce(form.job_description || '', 1500)

  // ═══ Load application (edit mode) ═══
  useEffect(() => {
    if (isEdit && id) {
      applicationsService
        .get(Number(id))
        .then((app) => {
          setForm({
            job_title: app.job_title,
            job_description: app.job_description || '',
            status: app.status,
            company_name: app.company?.name || '',
            source: app.source || '',
            salary_range: app.salary_range || '',
            notes: app.notes || '',
          })
        })
        .catch(() => setError('Failed to load application'))
        .finally(() => setLoadingData(false))
    }
  }, [id, isEdit])

  // ═══ ML Classification (Naive Bayes) ═══
  useEffect(() => {
    if (!debouncedNotes || debouncedNotes.trim().length < 10) {
      setMlSuggestion(null)
      return
    }
    let cancelled = false
    mlService
      .classifyStatus(debouncedNotes)
      .then((res) => {
        if (cancelled) return
        if (res.status && !res.needs_review) {
          setMlSuggestion({ status: res.status, confidence: res.confidence })
        } else {
          setMlSuggestion(null)
        }
      })
      .catch(() => {
        if (!cancelled) setMlSuggestion(null)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedNotes])

  // ═══ ML Duplicate check (Levenshtein) ═══
  useEffect(() => {
    if (
      debouncedTitle.trim().length < 3 ||
      debouncedCompany.trim().length < 2
    ) {
      setDuplicateWarn(null)
      return
    }
    let cancelled = false
    mlService
      .checkDuplicate(
        debouncedTitle,
        debouncedCompany,
        isEdit ? Number(id) : undefined
      )
      .then((res) => {
        if (cancelled) return
        setDuplicateWarn(res.has_duplicates ? res : null)
      })
      .catch(() => {
        if (!cancelled) setDuplicateWarn(null)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedTitle, debouncedCompany, id, isEdit])

  // ═══ AI Job Analysis (auto) ═══
  useEffect(() => {
    if (debouncedJobDesc.trim().length < 50) {
      setJobAnalysis(null)
      return
    }
    let cancelled = false
    setAnalyzingJob(true)
    aiService
      .parseJob(debouncedJobDesc)
      .then((res) => {
        if (!cancelled) setJobAnalysis(res)
      })
      .catch(() => {
        if (!cancelled) setJobAnalysis(null)
      })
      .finally(() => {
        if (!cancelled) setAnalyzingJob(false)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedJobDesc])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isEdit && id) {
        await applicationsService.update(Number(id), form)
        navigate(`/applications/${id}`)
      } else {
        const created = await applicationsService.create(form)
        navigate(`/applications/${created.id}`)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save application')
    } finally {
      setLoading(false)
    }
  }

  const update = (field: keyof ApplicationCreate, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  if (loadingData) {
    return (
      <Layout>
        <div className="text-gray-500">Loading...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {isEdit ? 'Edit Application' : 'New Application'}
        </h1>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Job Title *">
              <input
                type="text"
                required
                value={form.job_title}
                onChange={(e) => update('job_title', e.target.value)}
                className="input"
                placeholder="Frontend Developer"
              />
            </Field>

            <Field label="Company">
              <input
                type="text"
                value={form.company_name}
                onChange={(e) => update('company_name', e.target.value)}
                className="input"
                placeholder="Google"
              />
            </Field>

            <Field label="Status">
              {/* ML Suggestion Banner */}
              {mlSuggestion && mlSuggestion.status !== form.status && (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-2.5 mb-2">
                  <div className="flex items-center gap-2 text-xs text-blue-800">
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>
                      ML suggests:{' '}
                      <strong className="capitalize">
                        {mlSuggestion.status}
                      </strong>{' '}
                      ({mlSuggestion.confidence}%)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => update('status', mlSuggestion.status)}
                    className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Apply
                  </button>
                </div>
              )}

              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value)}
                className="input"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Source">
              <input
                type="text"
                value={form.source}
                onChange={(e) => update('source', e.target.value)}
                className="input"
                placeholder="LinkedIn"
              />
            </Field>

            <Field label="Salary Range">
              <input
                type="text"
                value={form.salary_range}
                onChange={(e) => update('salary_range', e.target.value)}
                className="input"
                placeholder="$60k - $80k"
              />
            </Field>
          </div>

          {/* Job Description + Auto Analysis */}
          <Field label="Job Description">
            <textarea
              rows={5}
              value={form.job_description}
              onChange={(e) => update('job_description', e.target.value)}
              className="input"
              placeholder="Paste the job description here... (analysis happens automatically)"
            />

            {analyzingJob && (
              <div className="mt-2 bg-zinc-50 border border-zinc-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing description with AI...</span>
                </div>
              </div>
            )}

            {jobAnalysis && !analyzingJob && (
              <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <p className="text-xs font-semibold text-emerald-900">
                    Auto Analysis
                  </p>
                </div>

                {jobAnalysis.summary && (
                  <div>
                    <p className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider mb-1">
                      Summary
                    </p>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      {jobAnalysis.summary}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {jobAnalysis.years_experience && (
                    <div>
                      <p className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider mb-0.5">
                        Experience
                      </p>
                      <p className="text-xs text-emerald-900">
                        {jobAnalysis.years_experience}
                      </p>
                    </div>
                  )}
                  {jobAnalysis.role_level && (
                    <div>
                      <p className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider mb-0.5">
                        Level
                      </p>
                      <p className="text-xs text-emerald-900 capitalize">
                        {jobAnalysis.role_level}
                      </p>
                    </div>
                  )}
                </div>

                {jobAnalysis.skills.length > 0 && (
                  <div>
                    <p className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider mb-1">
                      Required Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {jobAnalysis.skills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex px-2 py-0.5 rounded-md bg-white text-[11px] font-medium text-emerald-700 border border-emerald-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {jobAnalysis.ats_keywords.length > 0 && (
                  <div>
                    <p className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider mb-1">
                      ATS Keywords
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {jobAnalysis.ats_keywords.map((k) => (
                        <span
                          key={k}
                          className="inline-flex px-2 py-0.5 rounded-md bg-blue-50 text-[11px] font-medium text-blue-700 border border-blue-200"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Field>

          <Field label="Notes">
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              className="input"
              placeholder="Your notes... (e.g. 'They called me for an interview next week')"
            />
          </Field>

          {/* Duplicate Warning (Levenshtein) */}
          {duplicateWarn && duplicateWarn.count > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <p className="text-sm font-medium text-amber-900">
                  Found {duplicateWarn.count} similar application
                  {duplicateWarn.count > 1 ? 's' : ''}:
                </p>
              </div>
              <ul className="space-y-1">
                {duplicateWarn.matches.map((m) => (
                  <li key={m.id} className="text-xs text-amber-800">
                    • <strong>{m.job_title}</strong> at {m.company_name} —{' '}
                    <span className="text-amber-600">
                      {m.similarity}% similarity
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-amber-700 mt-2">
                Make sure it's not a duplicate before saving
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/applications')}
              className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}