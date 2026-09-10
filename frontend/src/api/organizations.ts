import { apiClient } from './client';
import { Organization } from '../types';

export const createOrganization = async (data: { name: string; slug: string; domain?: string }): Promise<Organization> => {
  const response = await apiClient.post<Organization>('/api/v1/organizations', data);
  return response.data;
};

export const fetchUserOrganizations = async (): Promise<Organization[]> => {
  const response = await apiClient.get<Organization[]>('/api/v1/organizations');
  return response.data;
};

export const fetchOrganizationById = async (id: string): Promise<Organization> => {
  const response = await apiClient.get<Organization>(`/api/v1/organizations/${id}`);
  return response.data;
};
