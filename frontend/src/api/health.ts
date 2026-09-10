import { apiClient } from './client';
import { HealthStatusResponse } from '../types';

export const fetchHealthStatus = async (): Promise<HealthStatusResponse> => {
  const response = await apiClient.get<HealthStatusResponse>('/api/v1/health');
  return response.data;
};
