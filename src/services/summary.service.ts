import api from "../lib/axios";
import { SummaryResponse } from "../types";

export const summaryService = {
  summarizeText: async (text: string): Promise<SummaryResponse> => {
    const response = await api.post<SummaryResponse>("/summary", { text });
    return response.data;
  },
};
