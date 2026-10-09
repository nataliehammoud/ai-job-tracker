import { api } from './api'

export interface ParsedJob {
  skills: string[]
  years_experience?: string | null
  role_level?: string | null
  ats_keywords: string[]
  summary: string
}

export interface CoverLetterResponse {
  cover_letter: string
}

export interface MatchResponse {
  match_score: number
  strengths: string[]
  gaps: string[]
  advice: string
}

export const aiService = {
  async parseJob(jobDescription: string): Promise<ParsedJob> {
    const res = await api.post<ParsedJob>('/api/ai/parse-job', {
      job_description: jobDescription,
    })
    return res.data
  },

  async generateCoverLetter(data: {
    job_title: string
    company_name: string
    job_description: string
    user_name: string
    user_background: string
  }): Promise<CoverLetterResponse> {
    const res = await api.post<CoverLetterResponse>(
      '/api/ai/cover-letter',
      data
    )
    return res.data
  },

  async matchResume(
    resume: string,
    jobDescription: string
  ): Promise<MatchResponse> {
    const res = await api.post<MatchResponse>('/api/ai/match', {
      resume,
      job_description: jobDescription,
    })
    return res.data
  },
}