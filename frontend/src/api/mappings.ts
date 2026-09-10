import { apiClient } from './client';
import { 
  ComplianceMapping, 
  CreateMappingRequest, 
  UpdateMappingRequest, 
  MappedSOPDetailResponse, 
  MappedRequirementDetailResponse 
} from '../types/mapping';

export const createMapping = async (
  orgId: string,
  payload: CreateMappingRequest
): Promise<ComplianceMapping> => {
  const response = await apiClient.post<ComplianceMapping>('/api/v1/mappings', payload, {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};

export const getMappings = async (
  orgId: string,
  regulationId?: string,
  requirementId?: string,
  sopId?: string,
  mappingType?: string,
  status?: string
): Promise<ComplianceMapping[]> => {
  const params: Record<string, string> = {};
  if (regulationId) params.regulationId = regulationId;
  if (requirementId) params.requirementId = requirementId;
  if (sopId) params.sopId = sopId;
  if (mappingType) params.mappingType = mappingType;
  if (status) params.status = status;

  const response = await apiClient.get<ComplianceMapping[]>('/api/v1/mappings', {
    headers: { 'X-Organization-Id': orgId },
    params,
  });
  return response.data;
};

export const getMappingById = async (orgId: string, id: string): Promise<ComplianceMapping> => {
  const response = await apiClient.get<ComplianceMapping>(`/api/v1/mappings/${id}`, {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};

export const updateMapping = async (
  orgId: string,
  id: string,
  payload: UpdateMappingRequest
): Promise<ComplianceMapping> => {
  const response = await apiClient.put<ComplianceMapping>(`/api/v1/mappings/${id}`, payload, {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};

export const deleteMapping = async (orgId: string, id: string): Promise<void> => {
  await apiClient.delete(`/api/v1/mappings/${id}`, {
    headers: { 'X-Organization-Id': orgId },
  });
};

export const getMappedSOPsForRegulation = async (
  orgId: string,
  regulationId: string
): Promise<MappedSOPDetailResponse[]> => {
  const response = await apiClient.get<MappedSOPDetailResponse[]>(`/api/v1/regulations/${regulationId}/mapped-sops`, {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};

export const getRequirementsForSOP = async (
  orgId: string,
  sopId: string
): Promise<MappedRequirementDetailResponse[]> => {
  const response = await apiClient.get<MappedRequirementDetailResponse[]>(`/api/v1/sops/${sopId}/requirements`, {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};
