export interface HealthStatusResponse {
  status: string;
  service: string;
  timestamp: string;
  database: string;
}

export type ConnectionState = 'online' | 'offline' | 'checking';
