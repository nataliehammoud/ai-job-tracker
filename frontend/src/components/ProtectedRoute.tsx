import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // ═══ الأدمن ما يدخل صفحات المستخدم ═══
  // يحوّل تلقائيًا لـ /admin
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}