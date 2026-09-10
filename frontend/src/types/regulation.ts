export type RegulationStatus = 'ACTIVE' | 'DRAFT' | 'SUPERSEDED' | 'ARCHIVED';

export interface Regulation {
  id: string;
  organizationId: string;
  title: string;
  jurisdiction: string;
  authority: string;
  category: string;
  status: RegulationStatus;
  publicationDate?: string;
  effectiveDate?: string;
  sourceId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegulationVersion {
  id: string;
  regulationId: string;
  versionNumber: number;
  documentReference: string;
  effectiveDate?: string;
  createdBy: string;
  createdAt: string;
}

export interface RegulatoryRequirement {
  id: string;
  regulationId: string;
  regulationVersionId?: string;
  requirementText: string;
  sectionReference: string;
  applicability?: string;
  effectiveDate?: string;
  sourceReference?: string;
  createdBy: string;
  createdAt: string;
}

export interface RegulatorySource {
  id: string;
  name: string;
  url?: string;
  type: string;
  createdAt: string;
}

export interface CreateRegulationRequest {
  title: string;
  jurisdiction: string;
  authority: string;
  category: string;
  status?: RegulationStatus;
  publicationDate?: string;
  effectiveDate?: string;
  sourceId?: string;
  initialDocumentReference?: string;
}

export interface CreateRegulationVersionRequest {
  documentReference: string;
  effectiveDate?: string;
}

export interface CreateRequirementRequest {
  regulationVersionId?: string;
  requirementText: string;
  sectionReference: string;
  applicability?: string;
  effectiveDate?: string;
  sourceReference?: string;
}

export interface RegulationMetricsResponse {
  totalRegulations: number;
  activeRegulations: number;
  draftRegulations: number;
  supersededRegulations: number;
  totalRequirements: number;
}

export interface PaginatedRegulationsResponse {
  content: Regulation[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}
