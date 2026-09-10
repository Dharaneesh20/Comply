import { apiClient } from './client';
import { 
  RegulatoryChange, 
  ChangeImpact, 
  AnalyzeChangePayload 
} from '../types/regulatoryChange';

export const analyzeRegulationChange = async (
  regulationId: string, 
  payload?: AnalyzeChangePayload
): Promise<RegulatoryChange> => {
  const response = await apiClient.post<RegulatoryChange>(
    `/regulations/${regulationId}/analyze-change`, 
    payload || {}
  );
  return response.data;
};

export const getRegulatoryChanges = async (regulationId?: string): Promise<RegulatoryChange[]> => {
  const response = await apiClient.get<RegulatoryChange[]>('/regulatory-changes', {
    params: { regulationId }
  });
  return response.data;
};

export const getRegulatoryChangeById = async (id: string): Promise<RegulatoryChange> => {
  const response = await apiClient.get<RegulatoryChange>(`/regulatory-changes/${id}`);
  return response.data;
};

export const getChangeImpacts = async (id: string): Promise<ChangeImpact[]> => {
  const response = await apiClient.get<ChangeImpact[]>(`/regulatory-changes/${id}/impacts`);
  return response.data;
};

export const updateImpactStatus = async (id: string, status: string): Promise<ChangeImpact> => {
  const response = await apiClient.post<ChangeImpact>(`/change-impacts/${id}/status`, { status });
  return response.data;
};
