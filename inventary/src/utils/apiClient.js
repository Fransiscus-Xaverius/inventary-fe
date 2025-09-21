import axios from "axios";

// Base URL from Vite env (fallback to localhost)
const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

const apiClient = axios.create({
  baseURL,
  withCredentials: false,
});

// Attach auth token if exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Basic response/error handling (could be expanded later)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can add global error handling (e.g., token expiry) here
    return Promise.reject(error);
  }
);

export default apiClient;
