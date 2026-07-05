import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
export const API_BASE = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gs_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const newToken = response.headers["x-new-token"];
    if (newToken) {
      localStorage.setItem("gs_token", newToken);
    }

    const body = response.data;
    if (body && typeof body === "object" && "success" in body) {
      if ("data" in body) {
        response.data = body.data;
        if (body.pagination) response.pagination = body.pagination;
      } else {
        const { success: _s, message: _m, ...rest } = body;
        response.data = rest;
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("gs_refresh_token");
      if (refreshToken) {
        originalRequest.headers["x-refresh-token"] = refreshToken;
        return api(originalRequest)
          .then((response) => {
            processQueue(null, localStorage.getItem("gs_token"));
            return response;
          })
          .catch((err) => {
            processQueue(err);
            localStorage.removeItem("gs_token");
            localStorage.removeItem("gs_refresh_token");
            if (window.location.pathname !== "/login" && window.location.pathname !== "/admin/login") {
              window.location.href = "/login";
            }
            return Promise.reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      }

      localStorage.removeItem("gs_token");
      localStorage.removeItem("gs_refresh_token");
    }

    if (error.response?.data && typeof error.response.data === "object") {
      const body = error.response.data;
      if ("message" in body && !body.detail) {
        body.detail = body.message;
      }
    }
    return Promise.reject(error);
  }
);

export function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export const PRODUCT_IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%23F5F5F7'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23A0A0A8' font-family='Arial,sans-serif' font-size='18'%3ENo image%3C/text%3E%3C/svg%3E";

export function resolveImage(url) {
  if (!url || url === "undefined" || url === "null") return PRODUCT_IMAGE_PLACEHOLDER;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `${BACKEND_URL}${url}`;
}
