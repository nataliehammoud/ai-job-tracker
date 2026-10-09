import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  Sparkles,
  Users,
  LogOut,
  FileText, 
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const userNav = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/applications', label: 'Applications', icon: Briefcase },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/ai-assistant', label: 'AI Assistant', icon: Sparkles },
]

const adminNav = [
  { path: '/admin', label: 'Overview', icon: LayoutDashboard },
  { path: '/admin/applications', label: 'Applications', icon: FileText },
  { path: '/admin/ai', label: 'AI Assistant', icon: Sparkles },  // ← جديد
  { path: '/admin/users', label: 'Users', icon: Users },
]

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  // ═══ القائمة حسب الدور ═══
  const navItems = isAdmin ? adminNav : userNav
  const homeLink = isAdmin ? '/admin' : '/dashboard'
  const sectionLabel = isAdmin ? 'Admin' : 'Workspace'

  return (
    <div className="min-h-screen bg-zinc-50">
      <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-zinc-200 flex flex-col">
        <div className="h-14 px-4 flex items-center border-b border-zinc-200">
          <Link to={homeLink} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-zinc-900 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <span className="text-sm font-semibold text-zinc-900 tracking-tight">
              Job Tracker
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <p className="px-2 py-1.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            {sectionLabel}
          </p>
          <div className="space-y-0.5 mt-1">
            {navItems.map((item) => (
              <SidebarLink
                key={item.path}
                {...item}
                active={location.pathname === item.path}
              />
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-zinc-200">
          <div className="flex items-center gap-2.5 p-2 rounded-md hover:bg-zinc-50 cursor-pointer group">
            <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate leading-tight">
                {user?.name}
              </p>
              <p className="text-xs text-zinc-500 truncate leading-tight">
                {isAdmin ? 'Admin' : 'Member'}
              </p>
            </div>
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-200 rounded"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5 text-zinc-600" />
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-60 min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}

function SidebarLink({
  path,
  label,
  icon: Icon,
  active,
}: {
  path: string
  label: string
  icon: any
  active: boolean
}) {
  return (
    <Link
      to={path}
      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors ${
        active
          ? 'bg-zinc-100 text-zinc-900 font-medium'
          : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
      <span>{label}</span>
    </Link>
  )
}