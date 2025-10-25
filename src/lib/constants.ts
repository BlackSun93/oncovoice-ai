// App Branding
export const APP_NAME = "OncoVoice AI";
export const APP_TAGLINE = "Clinical Discussion Intelligence";
export const COMPANY_NAME = "Cortex";
export const COMPANY_TAGLINE = "Innovative Solutions";

// Team Configuration
export const TEAMS = [
  { id: 1, name: "Team 1", color: "#0EA5E9", bgColor: "bg-blue-500", borderColor: "border-blue-500", hoverColor: "hover:bg-blue-600" },
  { id: 2, name: "Team 2", color: "#10B981", bgColor: "bg-emerald-500", borderColor: "border-emerald-500", hoverColor: "hover:bg-emerald-600" },
  { id: 3, name: "Team 3", color: "#8B5CF6", bgColor: "bg-violet-500", borderColor: "border-violet-500", hoverColor: "hover:bg-violet-600" },
  { id: 4, name: "Team 4", color: "#F59E0B", bgColor: "bg-amber-500", borderColor: "border-amber-500", hoverColor: "hover:bg-amber-600" },
  { id: 5, name: "Team 5", color: "#F43F5E", bgColor: "bg-rose-500", borderColor: "border-rose-500", hoverColor: "hover:bg-rose-600" },
] as const;

// Cortex Brand Colors (from logo)
export const CORTEX_COLORS = {
  blue: "#2E8BC0",
  teal: "#3BA99C",
  darkBlue: "#1B3B4D",
} as const;

// File Upload Limits
export const MAX_AUDIO_SIZE_MB = 25; // OpenAI Whisper limit
export const MAX_PDF_SIZE_MB = 10;
export const MAX_AUDIO_SIZE_BYTES = MAX_AUDIO_SIZE_MB * 1024 * 1024;
export const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

// Supported File Types
export const SUPPORTED_AUDIO_TYPES = [
  "audio/mpeg", // MP3
  "audio/mp4", // M4A
  "audio/x-m4a", // M4A alternative
  "audio/wav", // WAV
  "audio/webm", // WEBM
];

export const SUPPORTED_AUDIO_EXTENSIONS = [".mp3", ".m4a", ".wav", ".webm"];

export const SUPPORTED_PDF_TYPE = "application/pdf";

// Processing Status
export const STATUS = {
  IDLE: "idle",
  UPLOADING: "uploading",
  TRANSCRIBING: "transcribing",
  EXTRACTING_PDF: "extracting_pdf",
  ANALYZING: "analyzing",
  COMPLETED: "completed",
  ERROR: "error",
} as const;

// API Endpoints
export const API_ROUTES = {
  UPLOAD: "/api/upload",
  TRANSCRIBE: "/api/transcribe",
  ANALYZE: "/api/analyze",
  RESULTS: "/api/results",
} as const;

// UI Configuration
export const DASHBOARD_REFRESH_INTERVAL = 30000; // 30 seconds
export const MAX_PREVIEW_LENGTH = 200; // characters for preview cards

// Error Messages
export const ERROR_MESSAGES = {
  AUDIO_TOO_LARGE: `Audio file exceeds ${MAX_AUDIO_SIZE_MB}MB. Please compress your file.`,
  PDF_TOO_LARGE: `PDF file exceeds ${MAX_PDF_SIZE_MB}MB. Please use a smaller file.`,
  INVALID_AUDIO_TYPE: `Only ${SUPPORTED_AUDIO_EXTENSIONS.join(", ")} files are supported.`,
  INVALID_PDF_TYPE: "Only PDF files are supported.",
  UPLOAD_FAILED: "Upload failed. Check your internet connection and try again.",
  TRANSCRIPTION_FAILED: "Transcription service temporarily unavailable. Retrying...",
  ANALYSIS_FAILED: "Analysis incomplete. Please try again or contact support.",
  NETWORK_ERROR: "Network error. Please check your connection.",
} as const;
