export interface OperationalEvidence {
  id: string;
  organizationId: string;
  sopId: string;
  sopVersionId?: string;
  caseId?: string;
  eventType: string;
  timestamp: string;
  source: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ProcessDeviation {
  caseId: string;
  deviationType: 'SEQUENCE_OUT_OF_ORDER' | 'MISSING_STEP' | 'TIMED_OUT';
  description: string;
  expectedSteps: string[];
  observedSteps: string[];
  impactSeverity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface SOPHealthAssessment {
  id: string;
  organizationId: string;
  sopId: string;
  sopVersionId: string;
  healthScore: number;
  totalCasesAnalyzed: number;
  deviationsFoundCount: number;
  deviations: ProcessDeviation[];
  expectedSequence: string[];
  observedSequenceSample: string[];
  lastAnalyzedAt: string;
  createdAt: string;
}

export interface SubmitEvidencePayload {
  sopId: string;
  sopVersionId?: string;
  caseId?: string;
  eventType: string;
  timestamp?: string;
  source?: string;
  metadata?: Record<string, any>;
}

export interface SubmitObservationPayload {
  sopId: string;
  caseId?: string;
  steps: {
    eventType: string;
    source?: string;
  }[];
}
