import { apiClient } from './client';
import { AIAnalysis, AIReview } from '../types/ai';

export const triggerSOPAIAnalysis = async (orgId: string, sopId: string): Promise<AIAnalysis> => {
  const response = await apiClient.post<AIAnalysis>(`/api/v1/sops/${sopId}/analyze`, {}, {
    headers: { 'X-Organization-Id': orgId }
  });
  return response.data;
};

export const getSOPAIAnalyses = async (orgId: string, sopId: string): Promise<AIAnalysis[]> => {
  const response = await apiClient.get<AIAnalysis[]>(`/api/v1/sops/${sopId}/ai-analyses`, {
    headers: { 'X-Organization-Id': orgId }
  });
  return response.data;
};

export const submitAIReview = async (orgId: string, analysisId: string, decision: 'ACCEPT' | 'REJECT' | 'REVIEW', comment?: string): Promise<AIReview> => {
  const response = await apiClient.post<AIReview>(`/api/v1/ai-analyses/${analysisId}/review`, {
    decision,
    comment
  }, {
    headers: { 'X-Organization-Id': orgId }
  });
  return response.data;
};
