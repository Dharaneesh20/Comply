import { apiClient } from './client';
import { AuthResponse, User } from '../types';

export const registerUser = async (data: { fullName: string; email: string; password: string }): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', data);
  return response.data;
};

export const loginUser = async (data: { email: string; password: string }): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', data);
  return response.data;
};

export const fetchCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/api/v1/auth/me');
  return response.data;
};
