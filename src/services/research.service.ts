import api from "../lib/axios";
import { ResearchResponse } from "../types";

export const researchService = {
  researchTopic: async (topic: string): Promise<ResearchResponse> => {
    const response = await api.post<ResearchResponse>("/research", { topic });
    return response.data;
  },
};
