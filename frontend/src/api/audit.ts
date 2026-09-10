import { apiClient } from './client';
import { AuditEvent, SecurityConfigInfo } from '../types/audit';

export interface PaginatedAuditEvents {
  content: AuditEvent[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const getAuditEvents = async (
  orgId: string,
  action?: string,
  page: number = 0,
  size: number = 20
): Promise<PaginatedAuditEvents> => {
  const params: Record<string, any> = { page, size };
  if (action && action !== 'ALL') {
    params.action = action;
  }

  const response = await apiClient.get<PaginatedAuditEvents>('/api/v1/audit-events', {
    headers: { 'X-Organization-Id': orgId },
    params,
  });
  return response.data;
};

export const getSecurityConfig = async (orgId: string): Promise<SecurityConfigInfo> => {
  const response = await apiClient.get<SecurityConfigInfo>('/api/v1/security/config', {
    headers: { 'X-Organization-Id': orgId },
  });
  return response.data;
};
