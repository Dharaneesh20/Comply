export type FindingType = 'GAP' | 'OUTDATED_SOP' | 'MISSING_CONTROL' | 'PARTIAL_COVERAGE' | 'CONFLICTING_PROCEDURE';
export type FindingSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FindingStatus = 'OPEN' | 'UNDER_REVIEW' | 'ACCEPTED' | 'RESOLVED' | 'DISMISSED';

export interface ComplianceFinding {
  id: string;
  organizationId: string;
  requirementId?: string;
  regulationId?: string;
  sopId?: string;
  sopVersionId?: string;
  findingType: FindingType;
  severity: FindingSeverity;
  riskScore: number;
  title: string;
  description: string;
  evidence?: string;
  recommendedAction?: string;
  status: FindingStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface FindingResponse extends ComplianceFinding {
  sectionReference?: string;
  requirementText?: string;
  regulationTitle?: string;
  jurisdiction?: string;
  authority?: string;
  sopTitle?: string;
  department?: string;
}

export interface CreateFindingRequest {
  requirementId?: string;
  regulationId?: string;
  sopId?: string;
  sopVersionId?: string;
  findingType?: FindingType;
  severity?: FindingSeverity;
  riskScore?: number;
  title: string;
  description: string;
  evidence?: string;
  recommendedAction?: string;
  assignedTo?: string;
}

export interface UpdateFindingRequest {
  title?: string;
  description?: string;
  severity?: FindingSeverity;
  riskScore?: number;
  evidence?: string;
  recommendedAction?: string;
  assignedTo?: string;
}

export interface UpdateFindingStatusRequest {
  status: FindingStatus;
  notes?: string;
}

export interface FindingMetricsResponse {
  totalOpen: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  totalResolved: number;
}

export interface PaginatedFindingsResponse {
  content: FindingResponse[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}
