import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Applications from './pages/Applications'
import ApplicationForm from './pages/ApplicationForm'
import ApplicationDetails from './pages/ApplicationDetails'
import Analytics from './pages/Analytics'
import AIAssistant from './pages/AIAssistant'
import AdminOverview from './pages/AdminOverview'
import AdminUsers from './pages/AdminUsers'
import AdminApplications from './pages/AdminApplications'
import AdminAIAssistant from './pages/AdminAIAssistant'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
          <Route path="/applications/new" element={<ProtectedRoute><ApplicationForm /></ProtectedRoute>} />
          <Route path="/applications/:id" element={<ProtectedRoute><ApplicationDetails /></ProtectedRoute>} />
          <Route path="/applications/:id/edit" element={<ProtectedRoute><ApplicationForm /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
<Route
  path="/admin/applications"
  element={
    <AdminRoute>
      <AdminApplications />
    </AdminRoute>
  }
/>
<Route
  path="/admin/ai"
  element={
    <AdminRoute>
      <AdminAIAssistant />
    </AdminRoute>
  }
/>
          <Route path="/admin" element={<AdminRoute><AdminOverview /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App