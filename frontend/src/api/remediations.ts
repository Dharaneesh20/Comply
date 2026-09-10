import { apiClient } from './client';
import { 
  RemediationTask, 
  CreateRemediationPayload, 
  UpdateRemediationPayload,
  SOPReview,
  SOPApproval
} from '../types/remediation';

export const createRemediation = async (payload: CreateRemediationPayload): Promise<RemediationTask> => {
  const response = await apiClient.post<RemediationTask>('/remediations', payload);
  return response.data;
};

export const getRemediations = async (params?: { findingId?: string; sopId?: string }): Promise<RemediationTask[]> => {
  const response = await apiClient.get<RemediationTask[]>('/remediations', { params });
  return response.data;
};

export const getRemediationById = async (id: string): Promise<RemediationTask> => {
  const response = await apiClient.get<RemediationTask>(`/remediations/${id}`);
  return response.data;
};

export const updateRemediation = async (id: string, payload: UpdateRemediationPayload): Promise<RemediationTask> => {
  const response = await apiClient.put<RemediationTask>(`/remediations/${id}`, payload);
  return response.data;
};

export const submitSOPReview = async (sopId: string, comments: string, status: string, sopVersionId?: string): Promise<SOPReview> => {
  const response = await apiClient.post<SOPReview>(`/sops/${sopId}/review`, {
    sopVersionId,
    comments,
    status
  });
  return response.data;
};

export const approveSOPVersion = async (sopId: string, approvalNotes: string, status: string, sopVersionId?: string): Promise<SOPApproval> => {
  const response = await apiClient.post<SOPApproval>(`/sops/${sopId}/approve`, {
    sopVersionId,
    approvalNotes,
    status
  });
  return response.data;
};
