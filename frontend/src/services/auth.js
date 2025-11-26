// src/services/auth.js
import api from "./api";
import { Logger } from "../utils/helpers";

/**
 * Authentication service for API calls
 */
export const authService = {
  /**
   * Login user
   */
  async login(email, password) {
    try {
      Logger.info(`Attempting login for: ${email}`);
      const response = await api.post("/auth/login", { email, password });
      return response.data;
    } catch (error) {
      Logger.error("Login service error:", error);
      throw error;
    }
  },

  /**
   * Register new customer
   */
  async register(userData) {
    try {
      Logger.info(`Attempting registration for: ${userData.email}`);
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      Logger.error("Registration service error:", error);
      throw error;
    }
  },

  /**
   * Verify token validity
   */
  async verifyToken() {
    try {
      const response = await api.get("/auth/verify");
      return response.data;
    } catch (error) {
      Logger.error("Token verification error:", error);
      throw error;
    }
  },
};
