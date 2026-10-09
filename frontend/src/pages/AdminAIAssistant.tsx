import { useState } from 'react'
import {
  Sparkles,
  FileText,
  TrendingUp,
  Loader2,
  Send,
} from 'lucide-react'
import { toast } from 'sonner'
import Layout from '../components/Layout'
import { api } from '../services/api'

type Tab = 'report' | 'trend'

export default function AdminAIAssistant() {
  const [tab, setTab] = useState<Tab>('report')

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          Admin AI Assistant
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Platform insights powered by AI
        </p>
      </div>

      <div className="flex gap-1 mb-6 border-b border-zinc-200">
        <TabButton
          active={tab === 'report'}
          onClick={() => setTab('report')}
          icon={<FileText className="w-4 h-4" />}
          label="Weekly Report"
        />
        <TabButton
          active={tab === 'trend'}
          onClick={() => setTab('trend')}
          icon={<TrendingUp className="w-4 h-4" />}
          label="Trend Analysis"
        />
      </div>

      {tab === 'report' ? <ReportTab /> : <TrendTab />}
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
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
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

// ═══ Tab 1: Weekly Report ═══
function ReportTab() {
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    setReport('')
    try {
      const res = await api.post('/api/admin/ai/weekly-report')
      setReport(res.data.report)
      toast.success('Report generated')
    } catch {
      toast.error('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-zinc-900 mb-3">
          Generate Platform Report
        </h2>
        <p className="text-xs text-zinc-500 mb-4">
          AI analyzes platform stats and produces a weekly summary with insights.
        </p>
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
              Generate Weekly Report
            </>
          )}
        </button>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-zinc-900 mb-3">Report</h2>
        <ReportContent loading={loading} report={report} />
      </div>
    </div>
  )
}

// ═══ Tab 2: Trend Analysis ═══
function TrendTab() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  const ask = async () => {
    if (!question.trim()) {
      toast.error('Please write a question')
      return
    }
    setLoading(true)
    setAnswer('')
    try {
      const res = await api.post('/api/admin/ai/trend', { question })
      setAnswer(res.data.answer)
    } catch {
      toast.error('Failed to analyze')
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    'Which companies receive the most applications?',
    'What percentage of applications result in interviews?',
    'Summarize user activity patterns.',
  ]

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900">
          Ask about platform trends
        </h2>

        <textarea
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. What is the interview success rate?"
          className="input text-sm"
        />

        <div>
          <p className="text-xs text-zinc-500 mb-2">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setQuestion(s)}
                className="text-xs px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button onClick={ask} disabled={loading} className="btn-primary w-full">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Ask AI
            </>
          )}
        </button>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-zinc-900 mb-3">Answer</h2>
        <AnswerContent loading={loading} answer={answer} />
      </div>
    </div>
  )
}

// ═══ Content Components (single source of truth per state) ═══
function ReportContent({ loading, report }: { loading: boolean; report: string }) {
  if (loading) {
    return (
      <div className="space-y-3 py-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 skeleton rounded" />
        ))}
      </div>
    )
  }

  if (report) {
    return (
      <pre className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed font-sans animate-fade-in">
        {report}
      </pre>
    )
  }

  return (
    <div className="text-center py-16">
      <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 flex items-center justify-center mb-3">
        <FileText className="w-5 h-5 text-zinc-400" />
      </div>
      <p className="text-sm text-zinc-500">Report will appear here</p>
    </div>
  )
}

function AnswerContent({ loading, answer }: { loading: boolean; answer: string }) {
  if (loading) {
    return (
      <div className="space-y-3 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 skeleton rounded" />
        ))}
      </div>
    )
  }

  if (answer) {
    return (
      <div className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed animate-fade-in">
        {answer}
      </div>
    )
  }

  return (
    <div className="text-center py-16">
      <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 flex items-center justify-center mb-3">
        <TrendingUp className="w-5 h-5 text-zinc-400" />
      </div>
      <p className="text-sm text-zinc-500">AI answer will appear here</p>
    </div>
  )
}