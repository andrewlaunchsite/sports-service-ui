import axios from "axios";
import { ROOT_URL } from "../config/constants";
import { fetchToken } from "../auth/tokenBridge";

const axiosInstance = axios.create({
  baseURL: ROOT_URL,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(async (config) => {
  const reqURL = new URL(config.url ?? "", config.baseURL ?? ROOT_URL);
  const isSameOrigin =
    typeof window !== "undefined" && reqURL.origin === window.location.origin;

  if (!isSameOrigin) {
    const token = await fetchToken().catch(() => null);
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Helpers
const isPlainObject = (v: any) =>
  v !== null && typeof v === "object" && v.constructor === Object;

const pickMessage = (data: any, statusText?: string) => {
  if (!data) return statusText || "Request failed";
  if (typeof data === "string") return data;
  return (
    data.message || data.detail || data.error || statusText || "Request failed"
  );
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize into a SERIALIZABLE object the Redux store can handle
    if (error?.response) {
      const { status, statusText, data } = error.response;
      const message = pickMessage(data, statusText);
      const payload: any = {
        __isAxiosError: true,
        status,
        message,
      };
      // Keep server payload only if it's a plain JSON object
      if (isPlainObject(data)) payload.data = data;

      // Reject with a plain object (NOT an Error instance)
      return Promise.reject(payload);
    }

    if (error?.request) {
      return Promise.reject({
        __isAxiosError: true,
        status: null,
        message: "No response received",
      });
    }

    return Promise.reject({
      __isAxiosError: true,
      status: null,
      message: error?.message || "Unknown error",
    });
  }
);

export default axiosInstance;
