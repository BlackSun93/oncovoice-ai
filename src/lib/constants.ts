// App Branding
export const APP_NAME = "OncoVoice AI";
export const APP_TAGLINE = "Clinical Discussion Intelligence";
export const COMPANY_NAME = "Cortex";
export const COMPANY_TAGLINE = "Innovative Solutions";

// Breakout Sessions Configuration
export const BREAKOUT_SESSIONS = [
  { id: 1, name: "Breakout Session 1", teams: [1, 2, 3, 4, 5] },
  { id: 2, name: "Breakout Session 2", teams: [6, 7, 8, 9, 10] },
  { id: 3, name: "Breakout Session 3", teams: [11, 12, 13, 14, 15] },
] as const;

// Team Configuration - 15 teams across 3 sessions
export const TEAMS = [
  // Session 1
  { id: 1, name: "Team 1", topicName: "ILD and cancer therapy", sessionId: 1, color: "#0EA5E9", bgColor: "bg-blue-500", borderColor: "border-blue-500", hoverColor: "hover:bg-blue-600" },
  { id: 2, name: "Team 2", topicName: "Managing a patient with very early HER2+ disease", sessionId: 1, color: "#10B981", bgColor: "bg-emerald-500", borderColor: "border-emerald-500", hoverColor: "hover:bg-emerald-600" },
  { id: 3, name: "Team 3", topicName: "Radiotherapy after neoadjuvant therapy in 2025", sessionId: 1, color: "#8B5CF6", bgColor: "bg-violet-500", borderColor: "border-violet-500", hoverColor: "hover:bg-violet-600" },
  { id: 4, name: "Team 4", topicName: "What is peculiar about brain metastasis", sessionId: 1, color: "#F59E0B", bgColor: "bg-amber-500", borderColor: "border-amber-500", hoverColor: "hover:bg-amber-600" },
  { id: 5, name: "Team 5", topicName: "ADCs in HER2-positive breast cancer safety and efficacy", sessionId: 1, color: "#F43F5E", bgColor: "bg-rose-500", borderColor: "border-rose-500", hoverColor: "hover:bg-rose-600" },
  // Session 2
  { id: 6, name: "Team 6", topicName: "Dose dense chemotherapy with G-CSF support for early breast cancer", sessionId: 2, color: "#0EA5E9", bgColor: "bg-blue-500", borderColor: "border-blue-500", hoverColor: "hover:bg-blue-600" },
  { id: 7, name: "Team 7", topicName: "Management of isolated local recurrence", sessionId: 2, color: "#10B981", bgColor: "bg-emerald-500", borderColor: "border-emerald-500", hoverColor: "hover:bg-emerald-600" },
  { id: 8, name: "Team 8", topicName: "Managing AEs of targeted and endocrine therapy combinations", sessionId: 2, color: "#8B5CF6", bgColor: "bg-violet-500", borderColor: "border-violet-500", hoverColor: "hover:bg-violet-600" },
  { id: 9, name: "Team 9", topicName: "Molecular testing in Advanced ER+ breast cancer", sessionId: 2, color: "#F59E0B", bgColor: "bg-amber-500", borderColor: "border-amber-500", hoverColor: "hover:bg-amber-600" },
  { id: 10, name: "Team 10", topicName: "When to position ADCs in metastatic ER+ disease", sessionId: 2, color: "#F43F5E", bgColor: "bg-rose-500", borderColor: "border-rose-500", hoverColor: "hover:bg-rose-600" },
  // Session 3 (Placeholders)
  { id: 11, name: "Team 11", topicName: "Advanced Treatment Strategies", sessionId: 3, color: "#0EA5E9", bgColor: "bg-blue-500", borderColor: "border-blue-500", hoverColor: "hover:bg-blue-600" },
  { id: 12, name: "Team 12", topicName: "Emerging Therapeutic Approaches", sessionId: 3, color: "#10B981", bgColor: "bg-emerald-500", borderColor: "border-emerald-500", hoverColor: "hover:bg-emerald-600" },
  { id: 13, name: "Team 13", topicName: "Precision Medicine Applications", sessionId: 3, color: "#8B5CF6", bgColor: "bg-violet-500", borderColor: "border-violet-500", hoverColor: "hover:bg-violet-600" },
  { id: 14, name: "Team 14", topicName: "Novel Biomarker Development", sessionId: 3, color: "#F59E0B", bgColor: "bg-amber-500", borderColor: "border-amber-500", hoverColor: "hover:bg-amber-600" },
  { id: 15, name: "Team 15", topicName: "Immunotherapy Innovations", sessionId: 3, color: "#F43F5E", bgColor: "bg-rose-500", borderColor: "border-rose-500", hoverColor: "hover:bg-rose-600" },
] as const;

// Helper function to get teams for a specific session
export const getTeamsBySession = (sessionId: number) => {
  return TEAMS.filter(team => team.sessionId === sessionId);
};

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

// PDF Mapping - Maps team ID to PDF filename
export const TEAM_PDF_MAPPING: Record<number, string> = {
  1: "1-ILD and cancer therapy combined.pdf",
  2: "2-Managing a patient with very early HER2+ disease combined.pdf",
  3: "3-Radiotherapy after neoadjuvant therapy in 2025 combined.pdf",
  4: "4-What is peculiar about brain metastasis combined.pdf",
  5: "5-ADCs in HER2-positive breast cancer safety and efficacy combined.pdf",
  6: "6-Dose dense chemotherapy with G-CSF support for early breast cancer combined.pdf",
  7: "7-Management of isolated local recurrence combined.pdf",
  8: "8-Managing AEs of targeted and endocrine therapy combinations combined.pdf",
  9: "9-Molecular testing in Advanced ER+ breast cancer combined.pdf",
  10: "10-When to position ADCs in metastatic ER+ disease combined.pdf",
  11: "11-placeholder.pdf",
  12: "12-placeholder.pdf",
  13: "13-placeholder.pdf",
  14: "14-placeholder.pdf",
  15: "15-placeholder.pdf",
};

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
  SESSION_NOT_SELECTED: "Please select a breakout session first.",
} as const;
