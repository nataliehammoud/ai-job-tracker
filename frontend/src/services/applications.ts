import { api } from './api'

export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected'

export interface Company {
  id: number
  name: string
  website?: string | null
  location?: string | null
}

export interface Application {
  id: number
  job_title: string
  job_description?: string | null
  status: ApplicationStatus
  source?: string | null
  salary_range?: string | null
  notes?: string | null
  applied_date?: string | null
  created_at: string
  company?: Company | null
}

export interface ApplicationCreate {
  job_title: string
  job_description?: string
  status?: ApplicationStatus
  company_name?: string
  source?: string
  salary_range?: string
  notes?: string
}

export interface StatsOverview {
  total: number
  by_status: Record<string, number>
  monthly: { month: string; count: number }[]
  top_companies: { name: string; count: number }[]
  response_rate: number
}

export const applicationsService = {
  async list(): Promise<Application[]> {
    const res = await api.get<Application[]>('/api/applications')
    return res.data
  },

  async get(id: number): Promise<Application> {
    const res = await api.get<Application>(`/api/applications/${id}`)
    return res.data
  },

  async create(data: ApplicationCreate): Promise<Application> {
    const res = await api.post<Application>('/api/applications', data)
    return res.data
  },

  async update(
    id: number,
    data: Partial<ApplicationCreate>
  ): Promise<Application> {
    const res = await api.put<Application>(`/api/applications/${id}`, data)
    return res.data
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/applications/${id}`)
  },

  async stats(): Promise<StatsOverview> {
    const res = await api.get<StatsOverview>('/api/applications/stats/overview')
    return res.data
  },
}