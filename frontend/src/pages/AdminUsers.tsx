import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

interface AdminUser {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
  created_at: string
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get<AdminUser[]>('/api/admin/users')
      setUsers(res.data)
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const changeRole = async (userId: number, role: 'user' | 'admin') => {
    try {
      await api.patch(`/api/admin/users/${userId}/role?role=${role}`)
      loadUsers()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to change role')
    }
  }

  const deleteUser = async (userId: number) => {
    if (!confirm('Delete this user? This will also delete all their applications.')) return
    try {
      await api.delete(`/api/admin/users/${userId}`)
      loadUsers()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete')
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">👥 Users</h1>
          <p className="text-gray-600 mt-1">
            {users.length} user{users.length !== 1 ? 's' : ''} registered
          </p>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-lg text-center text-gray-500">
            Loading...
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id
                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-700 font-semibold text-sm">
                              {u.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {u.name}
                            {isSelf && (
                              <span className="ml-2 text-xs text-gray-500">
                                (you)
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">
                        {isSelf ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            👑 {u.role}
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) =>
                              changeRole(u.id, e.target.value as 'user' | 'admin')
                            }
                            className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isSelf && (
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}