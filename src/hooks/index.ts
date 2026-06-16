import { useMutation } from "@tanstack/react-query";
import { documentService } from "../services/document.service";
import { summaryService } from "../services/summary.service";
import { researchService } from "../services/research.service";
import {
  DocumentResponse,
  SummaryResponse,
  ResearchResponse,
} from "../types";
import { toast } from "sonner";


export const useDocumentAgent = () => {
  return useMutation<
    DocumentResponse,
    Error,
    { file: File; action: "grammar_check" | "rewrite" | "technical_improve" }
  >({
    mutationFn: async ({ file, action }) => {
      const res = await documentService.processDocument(file, action);
      if (!res || res.success === false) {
        throw new Error("AI service temporarily unavailable.");
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Document processed successfully!");
      // Update local statistics for dashboard view
      const current = Number(localStorage.getItem("stats_documents") || 0);
      localStorage.setItem("stats_documents", String(current + 1));
      window.dispatchEvent(new Event("storage_stats_updated"));
    },
    onError: () => {
      toast.error("AI service temporarily unavailable.");
    },
  });
};

export const useSummaryAgent = () => {
  return useMutation<SummaryResponse, Error, string>({
    mutationFn: async (text) => {
      const res = await summaryService.summarizeText(text);
      if (!res || res.success === false) {
        throw new Error("AI service temporarily unavailable.");
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Summary generated successfully!");
      // Update local statistics for dashboard view
      const current = Number(localStorage.getItem("stats_summaries") || 0);
      localStorage.setItem("stats_summaries", String(current + 1));
      window.dispatchEvent(new Event("storage_stats_updated"));
    },
    onError: () => {
      toast.error("AI service temporarily unavailable.");
    },
  });
};

export const useResearchAgent = () => {
  return useMutation<ResearchResponse, Error, string>({
    mutationFn: async (topic) => {
      const res = await researchService.researchTopic(topic);
      if (!res || res.success === false) {
        throw new Error("AI service temporarily unavailable.");
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Research report generated successfully!");
      // Update local statistics for dashboard view
      const current = Number(localStorage.getItem("stats_reports") || 0);
      localStorage.setItem("stats_reports", String(current + 1));
      window.dispatchEvent(new Event("storage_stats_updated"));
    },
    onError: () => {
      toast.error("AI service temporarily unavailable.");
    },
  });
};
