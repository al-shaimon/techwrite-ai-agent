import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://techwrite-ai-backend.vercel.app/api",
});

export default api;
