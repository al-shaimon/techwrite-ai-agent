export interface DocumentResponse {
  success: boolean;
  originalText: string;
  processedText: string;
  provider?: "gemini" | "openrouter";
}

export interface SummaryResponse {
  success: boolean;
  summary: string;
  keyPoints: string[];
  provider?: "gemini" | "openrouter";
}

export interface ResearchResponse {
  success: boolean;
  report: string;
  provider?: "gemini" | "openrouter";
}

export interface APIErrorResponse {
  success: boolean;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
