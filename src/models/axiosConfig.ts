import axios from "axios";
import { ROOT_URL } from "../config/constants";

const axiosInstance = axios.create({
  baseURL: ROOT_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Axios response error:", error);
    if (error.response) {
      const { status, data, statusText } = error.response;
      const payload =
        typeof data === "object"
          ? { ...data, status }
          : { message: data || statusText, status };

      return Promise.reject(payload);
    } else if (error.request) {
      console.error("Axios request error:", error.request);
      return Promise.reject({ message: "No response received", status: null });
    } else {
      console.error("Axios general error:", error.message);
      return Promise.reject({ message: error.message, status: null });
    }
  }
);

export default axiosInstance;
