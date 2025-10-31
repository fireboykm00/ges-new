import axios from "axios";
import type {
  StockItem,
  Supplier,
  Purchase,
  UsageRecord,
  Expense,
  MonthlyReport,
} from "../types";

const API_BASE_URL = "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for auth errors and better messages
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear auth data and notify subscribers
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");

      // Create a custom error for auth failures
      const authError = new Error(
        error?.response?.data?.message ||
          "Your session has expired. Please login again."
      );
      authError.name = "AuthenticationError";
      return Promise.reject(authError);
    }

    // Handle other errors
    const message =
      error?.response?.data?.message || error.message || "An error occurred";
    const enhancedError = new Error(message);
    enhancedError.name = error.name;
    return Promise.reject(enhancedError);
  }
);

interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role: "STAFF" | "MANAGER";
}

// Auth API
export const authAPI = {
  login: (username: string, password: string) =>
    api.post<{ token: string; role: string; username: string }>("/auth/login", {
      username,
      password,
    }),
  register: (data: RegisterData) =>
    api.post<{ token: string; role: string; message: string }>(
      "/auth/register",
      data
    ),
};

// Stock API
export const stockAPI = {
  getAll: () => api.get<StockItem[]>("/stocks"),
  getById: (id: number) => api.get<StockItem>(`/stocks/${id}`),
  create: (data: StockItem) => api.post<StockItem>("/stocks", data),
  update: (id: number, data: StockItem) =>
    api.put<StockItem>(`/stocks/${id}`, data),
  delete: (id: number) => api.delete<void>(`/stocks/${id}`),
};

// Supplier API
export const supplierAPI = {
  getAll: () => api.get<Supplier[]>("/suppliers"),
  getById: (id: number) => api.get<Supplier>(`/suppliers/${id}`),
  create: (data: Supplier) => api.post<Supplier>("/suppliers", data),
  update: (id: number, data: Supplier) =>
    api.put<Supplier>(`/suppliers/${id}`, data),
  delete: (id: number) => api.delete<void>(`/suppliers/${id}`),
};

// Purchase API
export const purchaseAPI = {
  getAll: () => api.get<Purchase[]>("/purchases"),
  getById: (id: number) => api.get<Purchase>(`/purchases/${id}`),
  create: (data: Purchase) => api.post<Purchase>("/purchases", data),
  delete: (id: number) => api.delete<void>(`/purchases/${id}`),
};

// Usage API
export const usageAPI = {
  getAll: () => api.get<UsageRecord[]>("/usages"),
  getById: (id: number) => api.get<UsageRecord>(`/usages/${id}`),
  create: (data: UsageRecord) => api.post<UsageRecord>("/usages", data),
  update: (id: number, data: UsageRecord) =>
    api.put<UsageRecord>(`/usages/${id}`, data),
  delete: (id: number) => api.delete<void>(`/usages/${id}`),
};

// Expense API
export const expenseAPI = {
  getAll: () => api.get<Expense[]>("/expenses"),
  getById: (id: number) => api.get<Expense>(`/expenses/${id}`),
  create: (data: Expense) => api.post<Expense>("/expenses", data),
  update: (id: number, data: Expense) =>
    api.put<Expense>(`/expenses/${id}`, data),
  delete: (id: number) => api.delete<void>(`/expenses/${id}`),
};

// Report API
export const reportAPI = {
  getMonthly: (month: string) =>
    api.get<MonthlyReport>(`/reports/monthly?month=${month}`),
};
