// src/services/api.js
// Update your api.js with detailed debugging
import axios from "axios";
import { Logger } from "../utils/helpers";
import { debugService } from "../services/debug";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Enhanced request interceptor
api.interceptors.request.use(
  (config) => {
    // Let browser set proper multipart boundaries for file uploads.
    if (config.data instanceof FormData) {
      if (config.headers?.set) {
        config.headers.set("Content-Type", undefined);
      } else if (config.headers) {
        delete config.headers["Content-Type"];
      }
    }

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

    // Log detailed request info in development
    if (import.meta.env.NODE_ENV === "development") {
      debugService.logApiRequest(config);
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    // Log detailed response in development
    if (import.meta.env.NODE_ENV === "development") {
      debugService.logApiResponse(response.config.url, response);
    }

    // Handle PHP warnings/errors in response
    if (typeof response.data === "string") {
      console.warn("⚠️ Response is string, attempting to parse as JSON...");

      // Check if it's HTML error page
      if (
        response.data.includes("<html") ||
        response.data.includes("<!DOCTYPE")
      ) {
        console.error(
          "❌ Server returned HTML instead of JSON. Likely PHP error:"
        );
        console.error(response.data.substring(0, 500));

        throw new Error("Server returned HTML error page. Check PHP logs.");
      }

      // Try to extract JSON
      try {
        const jsonMatch = response.data.match(/\{.*\}/s);
        if (jsonMatch) {
          response.data = JSON.parse(jsonMatch[0]);
          console.log("✅ Successfully extracted JSON from response");
        } else {
          console.error("❌ No JSON found in response string");
          console.log("Response preview:", response.data.substring(0, 500));
        }
      } catch (parseError) {
        console.error("❌ Failed to parse response as JSON:", parseError);
        console.log("Raw response:", response.data);
      }
    }

    // Validate response structure
    if (!response.data) {
      console.error("❌ Empty response data");
    } else if (!response.data.success && response.data.success !== false) {
      console.warn("⚠️ Response missing success property:", response.data);
    }

    Logger.debug(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const errorMessage =
      error.response?.data?.message || error.message || "Network error";

    // Log detailed error in development
    if (import.meta.env.NODE_ENV === "development") {
      debugService.logApiResponse(error.config?.url, null, error);
    }

    Logger.error("API Response Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
    });

    // Auto logout on 401
    if (error.response?.status === 401) {
      Logger.warn("Authentication failed (401), clearing tokens");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (typeof window !== "undefined") {
        window.location.replace("/");
      }
    }

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

// Add test method to api object
api.testConnection = debugService.testConnection;

export default api;
