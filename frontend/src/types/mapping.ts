export type MappingType = 'FULL' | 'PARTIAL' | 'NOT_IMPLEMENTED' | 'NOT_APPLICABLE';
export type MappingStatus = 'ACTIVE' | 'ARCHIVED';

export interface ComplianceMapping {
  id: string;
  organizationId: string;
  regulationId: string;
  regulationVersionId?: string;
  requirementId: string;
  sopId: string;
  sopVersionId?: string;
  mappingType: MappingType;
  confidence: number;
  status: MappingStatus;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMappingRequest {
  regulationId: string;
  regulationVersionId?: string;
  requirementId: string;
  sopId: string;
  sopVersionId?: string;
  mappingType?: MappingType;
  confidence?: number;
  notes?: string;
}

export interface UpdateMappingRequest {
  mappingType?: MappingType;
  confidence?: number;
  status?: MappingStatus;
  notes?: string;
  sopVersionId?: string;
}

export interface MappedSOPDetailResponse {
  mappingId: string;
  sopId: string;
  sopTitle: string;
  department: string;
  currentVersion: number;
  mappedVersionId?: string;
  requirementId: string;
  sectionReference: string;
  mappingType: MappingType;
  confidence: number;
  status: MappingStatus;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface MappedRequirementDetailResponse {
  mappingId: string;
  regulationId: string;
  regulationTitle: string;
  jurisdiction: string;
  authority: string;
  requirementId: string;
  sectionReference: string;
  requirementText: string;
  applicability?: string;
  mappingType: MappingType;
  confidence: number;
  status: MappingStatus;
  notes?: string;
  createdBy: string;
  createdAt: string;
}
