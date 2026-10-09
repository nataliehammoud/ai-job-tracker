import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Sparkles, Loader2, Briefcase, BarChart3, Sparkles as SparklesIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
const loggedUser = await login(email, password)
toast.success('Welcome back')
navigate(loggedUser.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left — Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-950 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-zinc-900" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Job Tracker
          </span>
        </div>

        {/* Middle */}
        <div className="relative">
          <h1 className="text-[42px] font-semibold tracking-tight leading-[1.1] mb-5">
            Track every
            <br />
            application.
            <br />
            <span className="text-zinc-600">Land the right role.</span>
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
            A focused workspace for your job search — organize applications,
            analyze your progress, and generate tailored cover letters.
          </p>

          <div className="mt-12 space-y-4 max-w-md">
            <Feature
              icon={<Briefcase className="w-4 h-4" />}
              title="Organize"
              text="Track every application in one clean view"
            />
            <Feature
              icon={<BarChart3 className="w-4 h-4" />}
              title="Analyze"
              text="See your progress at a glance"
            />
            <Feature
              icon={<SparklesIcon className="w-4 h-4" />}
              title="Generate"
              text="AI-powered cover letters in seconds"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex items-center gap-3 text-xs text-zinc-600">
          <span>© 2026 Job Tracker</span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span>Built with FastAPI + React</span>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="w-full max-w-sm mx-auto">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-900">
              Job Tracker
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-[26px] font-semibold text-zinc-900 tracking-tight">
              Sign in
            </h2>
            <p className="text-sm text-zinc-500 mt-2">
              Enter your credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <button
                  type="button"
                  className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
                  onClick={() => toast.info('Password reset coming soon')}
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-zinc-100 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-zinc-500" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-2.5 group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-zinc-500 text-center mt-8">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-zinc-900 font-medium hover:underline underline-offset-4"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0 text-zinc-300">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-white leading-tight">{title}</p>
        <p className="text-sm text-zinc-500 leading-tight mt-0.5">{text}</p>
      </div>
    </div>
  )
}