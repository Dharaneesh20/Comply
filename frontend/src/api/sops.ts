import { apiClient } from './client';
import { SOP, SOPVersion, CreateSOPRequest, UpdateSOPRequest, SOPMetricsResponse } from '../types/sop';

export const getSOPs = async (
  orgId: string,
  status?: string,
  department?: string
): Promise<SOP[]> => {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  if (department) params.department = department;

  const response = await apiClient.get<SOP[]>('/api/v1/sops', {
    headers: { 'X-Organization-Id': orgId },
    params,
  });
  return response.data;
};

export const getSOPById = async (orgId: string, id: string): Promise<SOP> => {
  const response = await apiClient.get<SOP>(`/api/v1/sops/${id}`, {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};

export const createSOP = async (orgId: string, payload: CreateSOPRequest): Promise<SOP> => {
  const response = await apiClient.post<SOP>('/api/v1/sops', payload, {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};

export const uploadSOP = async (
  orgId: string,
  file: File,
  title: string,
  department: string,
  description?: string,
  nextReviewAt?: string
): Promise<SOP> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('department', department);
  if (description) formData.append('description', description);
  if (nextReviewAt) formData.append('nextReviewAt', nextReviewAt);

  const response = await apiClient.post<SOP>('/api/v1/sops/upload', formData, {
    headers: {
      'X-Organization-Id': orgId,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateSOP = async (
  orgId: string,
  id: string,
  payload: UpdateSOPRequest
): Promise<SOP> => {
  const response = await apiClient.put<SOP>(`/api/v1/sops/${id}`, payload, {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};

export const createSOPVersion = async (
  orgId: string,
  id: string,
  file: File,
  changeSummary?: string
): Promise<SOPVersion> => {
  const formData = new FormData();
  formData.append('file', file);
  if (changeSummary) formData.append('changeSummary', changeSummary);

  const response = await apiClient.post<SOPVersion>(`/api/v1/sops/${id}/versions`, formData, {
    headers: {
      'X-Organization-Id': orgId,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getSOPVersions = async (orgId: string, id: string): Promise<SOPVersion[]> => {
  const response = await apiClient.get<SOPVersion[]>(`/api/v1/sops/${id}/versions`, {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};

export const archiveSOP = async (orgId: string, id: string): Promise<SOP> => {
  const response = await apiClient.post<SOP>(`/api/v1/sops/${id}/archive`, {}, {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};

export const getSOPMetrics = async (orgId: string): Promise<SOPMetricsResponse> => {
  const response = await apiClient.get<SOPMetricsResponse>('/api/v1/sops/metrics', {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};
