import { api } from './api'

export interface AdminApplication {
  id: number
  user_id: number
  user_name: string
  user_email: string
  job_title: string
  company_name: string
  status: string
  source: string | null
  salary_range: string | null
  applied_date: string | null
  created_at: string | null
}

export interface AdminApplicationDetail extends AdminApplication {
  job_description: string | null
  notes: string | null
  updated_at: string | null
}

export const adminAppsService = {
  async list(params?: { user_id?: number; status?: string }) {
    const res = await api.get<AdminApplication[]>('/api/admin/applications', {
      params,
    })
    return res.data
  },

  async get(id: number) {
    const res = await api.get<AdminApplicationDetail>(
      `/api/admin/applications/${id}`
    )
    return res.data
  },

  async remove(id: number) {
    await api.delete(`/api/admin/applications/${id}`)
  },
}