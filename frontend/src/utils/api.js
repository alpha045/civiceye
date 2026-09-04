import axios from "axios";

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.replace(/\/+$/, "");
    return url.endsWith("/api") ? url : `${url}/api`;
  }
  return import.meta.env.DEV ? "http://localhost:5001/api" : "/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("civiceye_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("civiceye_token");
      localStorage.removeItem("civiceye_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
