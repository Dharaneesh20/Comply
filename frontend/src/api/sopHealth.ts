import { apiClient } from './client';
import { 
  OperationalEvidence, 
  SOPHealthAssessment, 
  SubmitEvidencePayload, 
  SubmitObservationPayload 
} from '../types/sopHealth';

export const submitEvidence = async (payload: SubmitEvidencePayload): Promise<OperationalEvidence> => {
  const response = await apiClient.post<OperationalEvidence>('/evidence', payload);
  return response.data;
};

export const submitObservation = async (payload: SubmitObservationPayload): Promise<any> => {
  const response = await apiClient.post('/evidence/observation', payload);
  return response.data;
};

export const getEvidenceList = async (sopId?: string): Promise<OperationalEvidence[]> => {
  const response = await apiClient.get<OperationalEvidence[]>('/evidence', {
    params: { sopId }
  });
  return response.data;
};

export const analyzeSOPHealth = async (sopId: string): Promise<SOPHealthAssessment> => {
  const response = await apiClient.post<SOPHealthAssessment>(`/sop-health/analyze/${sopId}`);
  return response.data;
};

export const getSOPHealth = async (sopId: string): Promise<SOPHealthAssessment> => {
  const response = await apiClient.get<SOPHealthAssessment>(`/sop-health/${sopId}`);
  return response.data;
};
