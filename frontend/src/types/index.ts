export interface HealthStatusResponse {
  application: string;
  database: string;
}

export type ConnectionState = 'online' | 'offline' | 'checking';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logoUrl?: string;
  status: string;
  memberRole: string;
  createdAt: string;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}
