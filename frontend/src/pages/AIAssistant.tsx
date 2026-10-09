import { useState } from 'react'
import { mlService } from '../services/ml'
import {
  Sparkles,
  Mail,
  Target,
  Loader2,
  Copy,
  Check,
  Download,
  Cpu,
  Wand2,
} from 'lucide-react'
import { toast } from 'sonner'
import Layout from '../components/Layout'
import { aiService, type MatchResponse } from '../services/ai'

type Tab = 'cover' | 'match' | 'autostatus'

export default function AIAssistant() {
  const [tab, setTab] = useState<Tab>('cover')

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          AI Assistant
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Generate cover letters, match resumes, and classify applications
        </p>
      </div>

      <div className="flex gap-1 mb-6 border-b border-zinc-200">
        <TabButton
          active={tab === 'cover'}
          onClick={() => setTab('cover')}
          icon={<Mail className="w-4 h-4" />}
          label="Cover Letter"
        />
        <TabButton
          active={tab === 'match'}
          onClick={() => setTab('match')}
          icon={<Target className="w-4 h-4" />}
          label="Match Score"
        />
        <TabButton
          active={tab === 'autostatus'}
          onClick={() => setTab('autostatus')}
          icon={<Wand2 className="w-4 h-4" />}
          label="Auto Status"
        />
      </div>

      {tab === 'cover' && <CoverTab />}
      {tab === 'match' && <MatchTab />}
      {tab === 'autostatus' && <AutoStatusTab />}
    </Layout>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
        active
          ? 'border-zinc-900 text-zinc-900'
          : 'border-transparent text-zinc-500 hover:text-zinc-900'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

// ═══════════════════════════════════════════
// Tab 1: Cover Letter
// ═══════════════════════════════════════════

function CoverTab() {
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [description, setDescription] = useState('')
  const [background, setBackground] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    if (!jobTitle || !company || !description || !background) {
      toast.error('Please fill all fields')
      return
    }
    setLoading(true)
    setResult('')
    try {
      const { cover_letter } = await aiService.generateCoverLetter({
        job_title: jobTitle,
        company_name: company,
        job_description: description,
        user_name: 'Applicant',
        user_background: background,
      })
      setResult(cover_letter)
      toast.success('Cover letter generated')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'AI error')
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const download = () => {
    const blob = new Blob([result], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cover-letter-${company.toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded')
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900">Job Details</h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Job Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Frontend Developer"
              className="input"
            />
          </div>
          <div>
            <label className="label">Company</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Google"
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">Job Description</label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Paste job description..."
            className="input font-mono text-xs"
          />
        </div>

        <div>
          <label className="label">Your Background</label>
          <textarea
            rows={5}
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            placeholder="Brief summary: skills, experience, projects..."
            className="input text-sm"
          />
        </div>

        <button
          onClick={generate}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Cover Letter
            </>
          )}
        </button>
      </div>

      <div className="card p-5 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-900">Cover Letter</h2>
          {result && (
            <div className="flex gap-1">
              <button
                onClick={copy}
                className="p-1.5 rounded-md hover:bg-zinc-100 transition-colors"
                title="Copy"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4 text-zinc-500" />
                )}
              </button>
              <button
                onClick={download}
                className="p-1.5 rounded-md hover:bg-zinc-100 transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
          )}
        </div>

        {!result && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-500">
              Your cover letter will appear here
            </p>
          </div>
        )}

        {loading && (
          <div className="space-y-3 py-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-4 skeleton rounded" />
            ))}
          </div>
        )}

        {result && (
          <div className="flex-1 overflow-y-auto max-h-[500px] animate-fade-in">
            <pre className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed font-sans">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// Tab 2: Match Score (LLM + ML)
// ═══════════════════════════════════════════

function MatchTab() {
  const [resume, setResume] = useState('')
  const [description, setDescription] = useState('')
  const [llmResult, setLlmResult] = useState<MatchResponse | null>(null)
  const [mlResult, setMlResult] = useState<{
    match_score: number
    strengths: string[]
    gaps: string[]
    advice: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    if (!resume.trim() || !description.trim()) {
      toast.error('Please fill both fields')
      return
    }
    setLoading(true)
    setLlmResult(null)
    setMlResult(null)
    try {
      // ═══ Run both in parallel ═══
      const [llm, ml] = await Promise.allSettled([
        aiService.matchResume(resume, description),
        mlService.matchResumeToJob({
          resume,
          job_description: description,
        }),
      ])

      if (llm.status === 'fulfilled') setLlmResult(llm.value)
      if (ml.status === 'fulfilled') setMlResult(ml.value)

      if (llm.status === 'fulfilled' || ml.status === 'fulfilled') {
        toast.success('Match analysis ready')
      } else {
        toast.error('Both analyses failed')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Error')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-600'
    if (score >= 50) return 'text-amber-600'
    return 'text-rose-600'
  }

  const ScoreCircle = ({ score, label }: { score: number; label: string }) => (
    <div className="text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="42"
            stroke="#f4f4f5"
            strokeWidth="7"
            fill="none"
          />
          <circle
            cx="48"
            cy="48"
            r="42"
            stroke="currentColor"
            className={scoreColor(score)}
            strokeWidth="7"
            fill="none"
            strokeDasharray={`${(score / 100) * 263.9} 263.9`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-2xl font-bold tabular-nums ${scoreColor(score)}`}
          >
            {score}
          </span>
        </div>
      </div>
      <p className="text-xs text-zinc-500 mt-1">{label}</p>
    </div>
  )

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Input */}
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900">
          Compare Your Resume
        </h2>

        <div>
          <label className="label">Your Resume</label>
          <textarea
            rows={9}
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste your resume or CV content..."
            className="input font-mono text-xs"
          />
        </div>

        <div>
          <label className="label">Job Description</label>
          <textarea
            rows={9}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Paste the job description..."
            className="input font-mono text-xs"
          />
        </div>

        <button
          onClick={run}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing with both models...
            </>
          ) : (
            <>
              <Target className="w-4 h-4" />
              Calculate Match Score
            </>
          )}
        </button>
      </div>

      {/* Output */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">
          Match Analysis
        </h2>

        {!llmResult && !mlResult && !loading && (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-500">
              Your match scores will appear here
            </p>
          </div>
        )}

        {loading && (
          <div className="space-y-3 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 skeleton rounded" />
            ))}
          </div>
        )}

        {(llmResult || mlResult) && !loading && (
          <div className="space-y-6 animate-fade-in">
            {/* Two Scores */}
            <div className="grid grid-cols-2 gap-4">
              {llmResult && (
                <ScoreCircle score={llmResult.match_score} label="AI (LLM)" />
              )}
              {mlResult && (
                <ScoreCircle score={mlResult.match_score} label="ML (TF-IDF)" />
              )}
            </div>

            {/* Strengths (merged) */}
            {(llmResult?.strengths?.length || mlResult?.strengths?.length) && (
              <div>
                <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider mb-2">
                  ✓ Strengths
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    ...(mlResult?.strengths || []),
                    ...(llmResult?.strengths || []),
                  ]
                    .filter((v, i, arr) => arr.indexOf(v) === i)
                    .slice(0, 12)
                    .map((s, i) => (
                      <span
                        key={i}
                        className="inline-flex px-2 py-1 rounded-md bg-emerald-50 text-xs font-medium text-emerald-700"
                      >
                        {s}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Gaps (merged) */}
            {(llmResult?.gaps?.length || mlResult?.gaps?.length) && (
              <div>
                <p className="text-xs font-medium text-rose-700 uppercase tracking-wider mb-2">
                  ✗ Gaps
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    ...(mlResult?.gaps || []),
                    ...(llmResult?.gaps || []),
                  ]
                    .filter((v, i, arr) => arr.indexOf(v) === i)
                    .slice(0, 12)
                    .map((g, i) => (
                      <span
                        key={i}
                        className="inline-flex px-2 py-1 rounded-md bg-rose-50 text-xs font-medium text-rose-700"
                      >
                        {g}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Advice */}
            {llmResult?.advice && (
              <div className="bg-zinc-50 rounded-lg p-4">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  💡 Advice
                </p>
                <p className="text-sm text-zinc-700 leading-relaxed">
                  {llmResult.advice}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// Tab 3: Auto Status (Naive Bayes)
// ═══════════════════════════════════════════

function AutoStatusTab() {
  const [notes, setNotes] = useState('')
  const [result, setResult] = useState<{
    status: string | null
    confidence: number
    top_predictions: { status: string; probability: number }[]
    needs_review: boolean
    message: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const analyze = async () => {
    if (!notes.trim()) {
      toast.error('Please write some notes first')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const data = await mlService.classifyStatus(notes)
      setResult(data)
      toast.success('Classification complete')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'ML error')
    } finally {
      setLoading(false)
    }
  }

  const statusColor = (status: string) => {
    const map: Record<string, string> = {
      saved: 'bg-zinc-100 text-zinc-700',
      applied: 'bg-blue-50 text-blue-700',
      interview: 'bg-amber-50 text-amber-700',
      offer: 'bg-emerald-50 text-emerald-700',
      rejected: 'bg-rose-50 text-rose-700',
    }
    return map[status] || 'bg-zinc-100 text-zinc-700'
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-900">
            Naive Bayes Classifier
          </h2>
        </div>
        <p className="text-xs text-zinc-500 -mt-2">
          Predicts application status from free-text notes.
        </p>

        <div>
          <label className="label">Your Notes</label>
          <textarea
            rows={8}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. They called me for a phone screen next week..."
            className="input text-sm"
          />
        </div>

        <button
          onClick={analyze}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Classifying...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Predict Status
            </>
          )}
        </button>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">
          Prediction
        </h2>

        {!result && !loading && (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 flex items-center justify-center mb-3">
              <Wand2 className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-500">
              Prediction will appear here
            </p>
          </div>
        )}

        {loading && (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 skeleton rounded" />
            ))}
          </div>
        )}

        {result && result.status && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center py-6">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                Predicted Status
              </p>
              <span
                className={`inline-flex px-4 py-2 rounded-lg text-lg font-semibold capitalize ${statusColor(
                  result.status
                )}`}
              >
                {result.status}
              </span>
              <p className="text-2xl font-bold mt-3 tabular-nums">
                {result.confidence}%
              </p>
              <p className="text-xs text-zinc-500">confidence</p>
            </div>

            {result.needs_review && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                ⚠️ ثقة منخفضة — يُفضّل التأكد يدويًا
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                Top Predictions
              </p>
              <div className="space-y-2">
                {result.top_predictions.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-zinc-700 w-20 capitalize">
                      {p.status}
                    </span>
                    <div className="flex-1 bg-zinc-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-zinc-900 h-full transition-all"
                        style={{ width: `${p.probability}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-zinc-500 w-12 text-right">
                      {p.probability}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}