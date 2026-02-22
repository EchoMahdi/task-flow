// src/services/authService.js

import axios from "axios";

// ─── Axios Instance ────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// ─── CSRF Management ───────────────────────────────────────────────────────────

let csrfInitialized = false;
let csrfInitPromise = null;

export const initCsrf = () => {
  if (csrfInitialized) return Promise.resolve();
  if (csrfInitPromise) return csrfInitPromise;

  csrfInitPromise = api
    .get("/sanctum/csrf-cookie")
    .then(() => {
      csrfInitialized = true;
      csrfInitPromise = null;
    })
    .catch((err) => {
      csrfInitPromise = null;
      console.error("[CSRF] Failed to initialize:", err);
    });

  return csrfInitPromise;
};

export const resetCsrf = () => {
  csrfInitialized = false;
  csrfInitPromise = null;
};

// ─── Request Interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
  config.headers["Accept-Language"] =
    localStorage.getItem("app_language") || "en";
  return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/app/login";
      }
    } else if (status === 419) {
      resetCsrf();
    }

    return Promise.reject(error);
  },
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const extractData = (response) => {
  if (response.data?.success === false) {
    throw new Error(response.data.message || "Request failed");
  }

  return response.data?.data ?? response.data;
};

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  async login(email, password) {
    await initCsrf();
    const response = await api.post("/auth/login", { email, password });
    return extractData(response);
  },

  async register(name, email, password, passwordConfirmation) {
    await initCsrf();
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    return extractData(response);
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.warn("[Auth] Logout error:", error);
    } finally {
      resetCsrf();
    }
  },

  async getUser() {
    try {
      const response = await api.get("/auth/me");
      return extractData(response);
    } catch (error) {
      throw error;
    }
  },

  async forgotPassword(email) {
    await initCsrf();
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  async resetPassword(token, password, passwordConfirmation) {
    await initCsrf();
    const response = await api.post("/auth/reset-password", {
      token,
      password,
      password_confirmation: passwordConfirmation,
    });
    return response.data;
  },

  async isAuthenticated() {
    try {
      const user = await this.getUser();
      return !!user;
    } catch {
      return false;
    }
  },
};

export { api };
