export interface ChangedRequirementItem {
  requirementId: string;
  sectionReference: string;
  changeType: 'ADDED' | 'MODIFIED' | 'REMOVED' | 'EFFECTIVE_DATE_CHANGED';
  oldText?: string;
  newText?: string;
}

export interface RegulatoryChange {
  id: string;
  organizationId: string;
  regulationId: string;
  oldVersionId: string;
  newVersionId: string;
  oldVersionNumber: number;
  newVersionNumber: number;
  changeType: 'ADDED' | 'MODIFIED' | 'REMOVED' | 'EFFECTIVE_DATE_CHANGED';
  summary: string;
  changedRequirements: ChangedRequirementItem[];
  detectedAt: string;
  createdAt: string;
}

export interface ChangeImpact {
  id: string;
  organizationId: string;
  changeId: string;
  requirementId: string;
  sopId: string;
  sopTitle: string;
  sopVersionId: string;
  assignedDepartment: string;
  impactLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  requiredAction: string;
  status: 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'SOP_REVISED' | 'NO_ACTION_NEEDED';
  createdAt: string;
  updatedAt: string;
}

export interface AnalyzeChangePayload {
  oldVersionId?: string;
  newVersionId?: string;
}
