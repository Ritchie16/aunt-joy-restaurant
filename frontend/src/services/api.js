import axios from "axios";
import { Logger } from "../utils/helpers";

/**
 * API service configuration and interceptors
 */
const API_BASE_URL = "http://localhost:8000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      Logger.debug(
        `API Request with token: ${config.method?.toUpperCase()} ${config.url}`
      );
    } else {
      Logger.warn(
        `API Request without token: ${config.method?.toUpperCase()} ${
          config.url
        }`
      );
    }
    return config;
  },
  (error) => {
    Logger.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle PHP warnings and error handling
api.interceptors.response.use(
  (response) => {
    // Handle PHP warnings that corrupt JSON
    if (typeof response.data === "string") {
      try {
        // Try to extract JSON from the string
        const jsonMatch = response.data.match(/\{.*\}/s);
        if (jsonMatch) {
          response.data = JSON.parse(jsonMatch[0]);
          Logger.debug("API Response: Extracted JSON from corrupted response");
        }
      } catch (error) {
        Logger.error("API Response: Failed to parse corrupted JSON", error);
      }
    }

    Logger.debug(
      `API Response: ${response.status} ${response.config.url}`,
      response.data
    );
    return response;
  },
  (error) => {
    const errorMessage =
      error.response?.data?.message || error.message || "Network error";

    Logger.error("API Response Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: errorMessage,
    });

    // Auto logout on 401 Unauthorized
    if (error.response?.status === 401) {
      Logger.warn("Authentication failed (401), clearing tokens");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login page if we're in a browser environment
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default api;
