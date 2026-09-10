export interface AuditEvent {
  id: string;
  organizationId: string;
  actorId: string;
  actorEmail?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export interface SecurityConfigInfo {
  deploymentMode: string;
  externalAiEnabled: boolean;
  localSandboxEnabled: boolean;
  dataIsolationPolicy: string;
  storageEncryption: string;
  userRole: string;
}
