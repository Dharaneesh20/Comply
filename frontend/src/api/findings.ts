import { apiClient } from './client';
import { 
  ComplianceFinding, 
  FindingResponse, 
  CreateFindingRequest, 
  UpdateFindingRequest, 
  UpdateFindingStatusRequest, 
  FindingMetricsResponse,
  PaginatedFindingsResponse 
} from '../types/finding';

export const getFindings = async (
  orgId: string,
  search?: string,
  severity?: string,
  status?: string,
  department?: string,
  sopId?: string,
  regulationId?: string,
  page: number = 0,
  size: number = 10
): Promise<PaginatedFindingsResponse> => {
  const params: Record<string, string | number> = { page, size };
  if (search) params.search = search;
  if (severity) params.severity = severity;
  if (status) params.status = status;
  if (department) params.department = department;
  if (sopId) params.sopId = sopId;
  if (regulationId) params.regulationId = regulationId;

  const response = await apiClient.get<PaginatedFindingsResponse>('/api/v1/findings', {
    headers: { 'X-Organization-Id': orgId },
    params,
  });
  return response.data;
};

export const getFindingById = async (orgId: string, id: string): Promise<FindingResponse> => {
  const response = await apiClient.get<FindingResponse>(`/api/v1/findings/${id}`, {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};

export const createFinding = async (orgId: string, payload: CreateFindingRequest): Promise<ComplianceFinding> => {
  const response = await apiClient.post<ComplianceFinding>('/api/v1/findings', payload, {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};

export const updateFinding = async (
  orgId: string,
  id: string,
  payload: UpdateFindingRequest
): Promise<FindingResponse> => {
  const response = await apiClient.put<FindingResponse>(`/api/v1/findings/${id}`, payload, {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};

export const updateFindingStatus = async (
  orgId: string,
  id: string,
  payload: UpdateFindingStatusRequest
): Promise<FindingResponse> => {
  const response = await apiClient.post<FindingResponse>(`/api/v1/findings/${id}/status`, payload, {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};

export const evaluateRiskScan = async (orgId: string): Promise<ComplianceFinding[]> => {
  const response = await apiClient.post<ComplianceFinding[]>('/api/v1/findings/evaluate', {}, {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};

export const getFindingMetrics = async (orgId: string): Promise<FindingMetricsResponse> => {
  const response = await apiClient.get<FindingMetricsResponse>('/api/v1/findings/metrics', {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};
