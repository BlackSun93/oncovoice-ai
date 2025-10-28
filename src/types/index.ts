// Breakout Session types
export interface BreakoutSession {
  id: number;
  name: string;
  teams: readonly number[];
}

// Team types
export interface Team {
  id: number;
  name: string;
  topicName: string;
  sessionId: number;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverColor: string;
}

// Processing status types
export type ProcessingStatus =
  | "idle"
  | "uploading"
  | "transcribing"
  | "extracting_pdf"
  | "analyzing"
  | "completed"
  | "error";

// Result types
export interface TeamResult {
  teamId: number;
  teamName: string;
  audioFileUrl?: string;
  pdfFileUrl?: string;
  transcript: string;
  summary: string;
  conclusion: string;
  criticism: string;
  createdAt: string;
  status: ProcessingStatus;
  error?: string;
}

export interface AllResults {
  [key: string]: TeamResult | null; // team-1, team-2, etc.
}

// Upload types
export interface UploadProgress {
  audio: number; // 0-100
  pdf: number; // 0-100
}

export interface UploadedFiles {
  audio: File | null;
  pdf: File | null;
}

// API Response types
export interface UploadResponse {
  success: boolean;
  audioUrl?: string;
  pdfUrl?: string;
  error?: string;
}

export interface TranscribeResponse {
  success: boolean;
  transcript?: string;
  error?: string;
}

export interface AnalyzeResponse {
  success: boolean;
  result?: {
    summary: string;
    conclusion: string;
    criticism: string;
  };
  error?: string;
}

export interface ResultsResponse {
  success: boolean;
  results?: AllResults;
  error?: string;
}

// Processing step types
export interface ProcessingStep {
  id: string;
  label: string;
  status: "pending" | "in-progress" | "completed" | "error";
}

// Validation types
export interface ValidationError {
  field: "audio" | "pdf";
  message: string;
}
