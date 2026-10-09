import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Sparkles, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const checks = {
    length: password.length >= 6,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /\d/.test(password),
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!checks.length) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await register(name, email, password)
      toast.success('Account created')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed')
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

        <div className="relative flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-zinc-900" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Job Tracker
          </span>
        </div>

        <div className="relative">
          <h1 className="text-[42px] font-semibold tracking-tight leading-[1.1] mb-5">
            Everything you need
            <br />
            <span className="text-zinc-600">to find your next role.</span>
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-md mb-10">
            Set up your workspace in under a minute. No credit card, no fluff
            — just the tools you need.
          </p>

          <ul className="space-y-3 max-w-md">
            <Item text="Track applications across every company" />
            <Item text="Visualize your progress with analytics" />
            <Item text="Generate AI-powered cover letters" />
            <Item text="Export your data anytime" />
          </ul>
        </div>

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
              Create account
            </h2>
            <p className="text-sm text-zinc-500 mt-2">
              Get started in less than a minute.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Natalie Hammoud"
                className="input"
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

              {password && (
                <div className="mt-3 space-y-2">
                  <CheckItem checked={checks.length} text="At least 6 characters" />
                  <CheckItem checked={checks.hasLetter} text="Contains a letter" />
                  <CheckItem checked={checks.hasNumber} text="Contains a number" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-2.5 group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            <p className="text-xs text-zinc-500 text-center leading-relaxed pt-1">
              By signing up, you agree to our{' '}
              <a href="#" className="text-zinc-700 hover:underline">
                Terms
              </a>{' '}
              and{' '}
              <a href="#" className="text-zinc-700 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </form>

          <p className="text-sm text-zinc-500 text-center mt-8">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-zinc-900 font-medium hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Item({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-sm text-zinc-300">
      <div className="w-[18px] h-[18px] rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
      </div>
      {text}
    </li>
  )
}

function CheckItem({ checked, text }: { checked: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-200 ${
          checked ? 'bg-emerald-500 scale-100' : 'bg-zinc-200 scale-95'
        }`}
      >
        {checked && <Check className="w-2 h-2 text-white" strokeWidth={4} />}
      </div>
      <span
        className={`text-xs transition-colors duration-200 ${
          checked ? 'text-zinc-700' : 'text-zinc-400'
        }`}
      >
        {text}
      </span>
    </div>
  )
}