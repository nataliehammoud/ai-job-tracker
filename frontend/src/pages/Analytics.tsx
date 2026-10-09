import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { TrendingUp, Target, Award, Briefcase } from 'lucide-react'
import Layout from '../components/Layout'
import { applicationsService, type StatsOverview } from '../services/applications'

const STATUS_COLORS: Record<string, string> = {
  saved: '#a1a1aa',
  applied: '#3b82f6',
  interview: '#f59e0b',
  offer: '#10b981',
  rejected: '#ef4444',
}

const STATUS_LABELS: Record<string, string> = {
  saved: 'Saved',
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
}

export default function Analytics() {
  const [stats, setStats] = useState<StatsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    applicationsService
      .stats()
      .then(setStats)
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="mb-8">
          <div className="h-7 w-32 skeleton rounded mb-2" />
          <div className="h-4 w-56 skeleton rounded" />
        </div>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-4 h-24 skeleton" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="card h-80 skeleton" />
          <div className="card h-80 skeleton" />
        </div>
      </Layout>
    )
  }

  if (error || !stats) {
    return (
      <Layout>
        <div className="card p-5 text-sm text-rose-600 bg-rose-50 border-rose-100">
          {error || 'No data'}
        </div>
      </Layout>
    )
  }

  const pieData = Object.entries(stats.by_status)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: STATUS_LABELS[status],
      value: count,
      color: STATUS_COLORS[status],
    }))

  const hasData = stats.total > 0

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
          Analytics
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Insights from your job search
        </p>
      </div>

      {!hasData ? (
        <div className="card py-16 px-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5 text-zinc-400" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">
            No data yet
          </h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto">
            Add some applications to see your analytics.
          </p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <KPI
              label="Total applications"
              value={stats.total.toString()}
              icon={<Briefcase className="w-4 h-4" />}
            />
            <KPI
              label="Response rate"
              value={`${stats.response_rate}%`}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <KPI
              label="Interviews"
              value={stats.by_status.interview.toString()}
              icon={<Target className="w-4 h-4" />}
            />
            <KPI
              label="Offers"
              value={stats.by_status.offer.toString()}
              icon={<Award className="w-4 h-4" />}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
            {/* Monthly */}
            <div className="card lg:col-span-3 p-5">
              <div className="mb-5">
                <h2 className="text-sm font-semibold text-zinc-900">
                  Applications over time
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Last 6 months
                </p>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stats.monthly}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f4f4f5"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#a1a1aa"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#a1a1aa"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f4f4f5' }}
                    contentStyle={{
                      background: '#18181b',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                      padding: '8px 12px',
                    }}
                    labelStyle={{ color: '#a1a1aa' }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#18181b"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Status Breakdown */}
            <div className="card lg:col-span-2 p-5">
              <div className="mb-5">
                <h2 className="text-sm font-semibold text-zinc-900">
                  Status breakdown
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  By current state
                </p>
              </div>
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#18181b',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#fff',
                        padding: '8px 12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="w-full mt-3 space-y-2">
                  {pieData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: item.color }}
                        />
                        <span className="text-zinc-600">{item.name}</span>
                      </div>
                      <span className="text-zinc-900 font-medium tabular-nums">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Companies */}
          {stats.top_companies.length > 0 && (
            <div className="card p-5">
              <div className="mb-5">
                <h2 className="text-sm font-semibold text-zinc-900">
                  Top companies
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Where you applied most
                </p>
              </div>
              <div className="space-y-3">
                {stats.top_companies.map((c) => {
                  const max = stats.top_companies[0].count
                  const pct = (c.count / max) * 100
                  return (
                    <div key={c.name} className="flex items-center gap-3">
                      <div className="w-32 text-sm text-zinc-700 truncate">
                        {c.name}
                      </div>
                      <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-zinc-900 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm text-zinc-900 font-medium tabular-nums w-6 text-right">
                        {c.count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  )
}

function KPI({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-zinc-500 font-medium">{label}</p>
        <div className="text-zinc-400">{icon}</div>
      </div>
      <p className="text-2xl font-semibold text-zinc-900 tabular-nums">
        {value}
      </p>
    </div>
  )
}