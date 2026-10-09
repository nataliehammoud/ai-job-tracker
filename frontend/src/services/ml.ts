import { api } from './api';

export interface MatchRequest {
  resume: string;
  job_description: string;
}

export interface MatchResponse {
  match_score: number;
  strengths: string[];
  gaps: string[];
  advice: string;
}

export interface ClassifyResponse {
  status: string | null;
  confidence: number;
  top_predictions: { status: string; probability: number }[];
  needs_review: boolean;
  message: string;
}

export const mlService = {
  async matchResumeToJob(data: MatchRequest): Promise<MatchResponse> {
    const response = await api.post<MatchResponse>('/api/ml/match', data);
    return response.data;
  },

  async classifyStatus(notes: string): Promise<ClassifyResponse> {
    const response = await api.post<ClassifyResponse>('/api/ml/classify-status', {
      notes,
    });
    return response.data;
  },
    async getMyClusters(): Promise<ClustersResponse> {
    const response = await api.get<ClustersResponse>('/api/ml/clusters/me');
    return response.data;
  },

  async checkDuplicate(
    job_title: string,
    company_name: string,
    exclude_id?: number
  ): Promise<DuplicateResponse> {
    const response = await api.post<DuplicateResponse>('/api/ml/check-duplicate', {
      job_title,
      company_name,
      exclude_id,
    });
    return response.data;
  },
};
// ═══ K-Means ═══
export interface ClusterCompany {
  id: number;
  name: string;
  location: string | null;
  applications_count: number;
}

export interface Cluster {
  cluster_id: number;
  label: string;
  size: number;
  avg_applications: number;
  avg_success_rate: number;
  top_location: string;
  companies: ClusterCompany[];
}

export interface ClustersResponse {
  clusters: Cluster[];
  n_clusters: number;
  message: string;
}

// ═══ Duplicates ═══
export interface DuplicateMatch {
  id: number;
  job_title: string;
  company_name: string;
  status: string;
  applied_date: string | null;
  similarity: number;
}

export interface DuplicateResponse {
  has_duplicates: boolean;
  count: number;
  matches: DuplicateMatch[];
}