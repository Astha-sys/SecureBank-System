import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post("/api/auth/register", data, { withCredentials: true }),

  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data, { withCredentials: true }),
};


// Account API
export const accountApi = {
  create: (data: { accountType: string }) =>
    api.post("/api/accounts", data),
};

export default api;
