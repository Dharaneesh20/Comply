export type RemediationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RemediationStatus = 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED';

export interface RemediationTask {
  id: string;
  organizationId: string;
  findingId?: string;
  sopId?: string;
  title: string;
  description?: string;
  assignedTo?: string;
  priority: RemediationPriority;
  status: RemediationStatus;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

export interface CreateRemediationPayload {
  findingId?: string;
  sopId?: string;
  title: string;
  description?: string;
  assignedTo?: string;
  priority?: RemediationPriority;
  dueDate?: string;
}

export interface UpdateRemediationPayload {
  title?: string;
  description?: string;
  assignedTo?: string;
  priority?: RemediationPriority;
  status?: RemediationStatus;
  dueDate?: string;
}

export interface SOPReview {
  id: string;
  organizationId: string;
  sopId: string;
  sopVersionId: string;
  reviewerId: string;
  comments: string;
  status: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED';
  createdAt: string;
}

export interface SOPApproval {
  id: string;
  organizationId: string;
  sopId: string;
  sopVersionId: string;
  approverId: string;
  approvalNotes: string;
  status: 'APPROVED' | 'REJECTED';
  createdAt: string;
}
