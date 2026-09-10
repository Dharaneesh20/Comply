export type PipelineStage = 
  | 'DOCUMENT_RECEIVED'
  | 'TEXT_EXTRACTION'
  | 'TEXT_CHUNKING'
  | 'REGULATORY_SEARCH'
  | 'REGULATORY_VERIFICATION'
  | 'SEMANTIC_MATCHING'
  | 'GAP_DETECTION'
  | 'CONFLICT_DETECTION'
  | 'COMPLETED'
  | 'FAILED';

export type StageStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface PipelineStageConfig {
  id: PipelineStage;
  label: string;
  description: string;
  weightProgress: number;
}

export interface SearXNGResult {
  title: string;
  url: string;
  content: string;
  domain: string;
  favicon?: string;
  engine?: string;
}

export interface ModelStatus {
  model: string;
  available: boolean;
  is_loaded: boolean;
  status: 'READY' | 'LOADING' | 'UNAVAILABLE';
}

export interface SemanticMatchItem {
  requirementText: string;
  sopSection: string;
  similarityScore: number;
  status: string;
  excerpt: string;
}

export interface GapDetectionItem {
  requirement: string;
  finding: string;
  confidence: number;
  recommendation: string;
}

export interface AnalysisStreamEvent {
  analysisId: string;
  timestamp: string;
  stage: PipelineStage;
  status: StageStatus;
  progress: number;
  message: string;
  metadata?: {
    documentTitle?: string;
    textSize?: number;
    sectionCount?: number;
    chunkCount?: number;
    chunks?: Array<{ id: string; text: string; section?: string }>;
    query?: string;
    subEvent?: string;
    result?: SearXNGResult;
    results?: SearXNGResult[];
    modelInfo?: ModelStatus;
    matches?: SemanticMatchItem[];
    gaps?: GapDetectionItem[];
    summary?: Record<string, any>;
    [key: string]: any;
  };
}
