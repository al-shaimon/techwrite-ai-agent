import api from "../lib/axios";
import { DocumentResponse } from "../types";

export const documentService = {
  processDocument: async (
    file: File,
    action: "grammar_check" | "rewrite" | "technical_improve"
  ): Promise<DocumentResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("action", action);

    const response = await api.post<DocumentResponse>(
      "/document/process",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};
