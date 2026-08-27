import axios from "axios";
import { enqueueRequest, isQueueable } from "@/lib/offlineQueue";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api/v1",
  timeout: 20000,
});

let tokenGetter = async () => null;

export function setAuthTokenGetter(fn) {
  tokenGetter = fn;
}

api.interceptors.request.use(async (config) => {
  const token = await tokenGetter();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (typeof window !== "undefined" && !navigator.onLine && isQueueable(config)) {
    enqueueRequest(config);
    config.adapter = async () => ({
      data: { success: true, data: { queued: true } },
      status: 202,
      statusText: "Queued",
      headers: {},
      config,
    });
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.error?.message || error.message || "Request failed";
    const wrapped = new Error(message);
    wrapped.status = error.response?.status;
    wrapped.code = error.response?.data?.error?.code;
    throw wrapped;
  }
);
