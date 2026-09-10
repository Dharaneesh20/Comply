export type SOPStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface DocumentMetadata {
  originalFilename: string;
  contentType: string;
  fileSizeBytes: number;
  checksumSha256?: string;
}

export interface SOPVersion {
  id: string;
  sopId: string;
  versionNumber: number;
  documentMetadata: DocumentMetadata;
  storageReference: string;
  createdBy: string;
  createdAt: string;
  changeSummary?: string;
}

export interface SOP {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  department: string;
  ownerId: string;
  status: SOPStatus;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  latestVersion?: SOPVersion;
}

export interface CreateSOPRequest {
  title: string;
  description?: string;
  department: string;
  nextReviewAt?: string;
}

export interface UpdateSOPRequest {
  title?: string;
  description?: string;
  department?: string;
  ownerId?: string;
  status?: SOPStatus;
  nextReviewAt?: string;
}

export interface SOPMetricsResponse {
  totalSops: number;
  publishedSops: number;
  draftSops: number;
  archivedSops: number;
}
