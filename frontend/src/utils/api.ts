import axios from "axios";

// Khi VITE_API_URL là empty string ("") → Axios dùng relative URL → Nginx proxy xử lý
// Khi VITE_API_URL là "http://localhost:5000" → gọi trực tiếp (local dev không dùng Docker)
const baseURL = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : "http://localhost:5000";

// Create axios instance with base URL
export const api = axios.create({
  baseURL,
});

// Add request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);