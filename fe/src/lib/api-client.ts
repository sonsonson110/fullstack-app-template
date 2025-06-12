import { authApi } from "@/api/auth";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import qs from "qs";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  paramsSerializer: (params) => {
    return qs.stringify(params, {
      arrayFormat: "repeat", // field=1&field=2
    });
  },
});

let isRefreshing = false;
let refreshSubscribers: ((shouldRetry: boolean) => void)[] = [];

const processQueue = (shouldRetry: boolean) => {
  refreshSubscribers.forEach((callback) => callback(shouldRetry));
  refreshSubscribers = [];
};

const addSubscriber = (callback: (shouldRetry: boolean) => void) => {
  refreshSubscribers.push(callback);
};

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          await authApi.refreshToken();
          processQueue(true); // Success - retry requests
          isRefreshing = false;
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(false); // Failure - reject requests
          isRefreshing = false;
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        return new Promise((resolve, reject) => {
          addSubscriber((shouldRetry) => {
            if (shouldRetry) {
              resolve(apiClient(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
