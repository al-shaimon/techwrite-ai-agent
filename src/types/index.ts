export interface DocumentResponse {
  model: string | undefined;
  success: boolean;
  originalText: string;
  processedText: string;
  provider?: "gemini" | "openrouter";
}

export interface SummaryResponse {
  model: string | undefined;
  success: boolean;
  summary: string;
  keyPoints: string[];
  provider?: "gemini" | "openrouter";
}

export interface ResearchResponse {
  success: boolean;
  report: string;
  provider?: "gemini" | "openrouter";
  model?: string;
}

export interface APIErrorResponse {
  success: boolean;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
