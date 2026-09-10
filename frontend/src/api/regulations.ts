import { apiClient } from './client';
import { 
  Regulation, 
  RegulationVersion, 
  RegulatoryRequirement, 
  CreateRegulationRequest, 
  CreateRegulationVersionRequest, 
  CreateRequirementRequest, 
  RegulationMetricsResponse,
  PaginatedRegulationsResponse
} from '../types/regulation';

export const getRegulations = async (
  orgId: string,
  search?: string,
  jurisdiction?: string,
  authority?: string,
  status?: string,
  page: number = 0,
  size: number = 10
): Promise<PaginatedRegulationsResponse> => {
  const params: Record<string, string | number> = { page, size };
  if (search) params.search = search;
  if (jurisdiction) params.jurisdiction = jurisdiction;
  if (authority) params.authority = authority;
  if (status) params.status = status;

  const response = await apiClient.get<PaginatedRegulationsResponse>('/api/v1/regulations', {
    headers: { 'X-Organization-Id': orgId },
    params,
  });
  return response.data;
};

export const getRegulationById = async (orgId: string, id: string): Promise<Regulation> => {
  const response = await apiClient.get<Regulation>(`/api/v1/regulations/${id}`, {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};

export const createRegulation = async (orgId: string, payload: CreateRegulationRequest): Promise<Regulation> => {
  const response = await apiClient.post<Regulation>('/api/v1/regulations', payload, {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};

export const createRegulationVersion = async (
  orgId: string,
  id: string,
  payload: CreateRegulationVersionRequest
): Promise<RegulationVersion> => {
  const response = await apiClient.post<RegulationVersion>(`/api/v1/regulations/${id}/versions`, payload, {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};

export const getRegulationVersions = async (orgId: string, id: string): Promise<RegulationVersion[]> => {
  const response = await apiClient.get<RegulationVersion[]>(`/api/v1/regulations/${id}/versions`, {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};

export const addRequirement = async (
  orgId: string,
  id: string,
  payload: CreateRequirementRequest
): Promise<RegulatoryRequirement> => {
  const response = await apiClient.post<RegulatoryRequirement>(`/api/v1/regulations/${id}/requirements`, payload, {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};

export const getRequirements = async (
  orgId: string,
  id: string,
  versionId?: string
): Promise<RegulatoryRequirement[]> => {
  const params: Record<string, string> = {};
  if (versionId) params.versionId = versionId;

  const response = await apiClient.get<RegulatoryRequirement[]>(`/api/v1/regulations/${id}/requirements`, {
    headers: { 'X-Organization-Id': orgId },
    params,
  });
  return response.data;
};

export const getRegulationMetrics = async (orgId: string): Promise<RegulationMetricsResponse> => {
  const response = await apiClient.get<RegulationMetricsResponse>('/api/v1/regulations/metrics', {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};
