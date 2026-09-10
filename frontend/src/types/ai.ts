export interface AIAnalysis {
  id: string;
  organizationId: string;
  documentId: string;
  documentVersion: number;
  analysisType: string;
  modelName: string;
  modelVersion: string;
  pipelineVersion: string;
  results: Record<string, any>[];
  createdAt: string;
}

export interface AIReview {
  id: string;
  organizationId: string;
  analysisId: string;
  reviewerId: string;
  decision: 'ACCEPT' | 'REJECT' | 'REVIEW';
  comment?: string;
  createdAt: string;
}
