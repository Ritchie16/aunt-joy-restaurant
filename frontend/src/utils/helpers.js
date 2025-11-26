//src/utils/helpers.js
/**
 * Utility functions and helpers
 */

/**
 * Logger utility for consistent logging
 */
export class Logger {
  static log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    // Fix: Use correct console method for 'info'
    const consoleMethod = level === "info" ? "log" : level;
    if (data) {
      console[consoleMethod](logMessage, data);
    } else {
      console[consoleMethod](logMessage);
    }
  }

  static info(message, data = null) {
    this.log("info", message, data);
  }

  static warn(message, data = null) {
    this.log("warn", message, data);
  }

  static error(message, data = null) {
    this.log("error", message, data);
  }

  static debug(message, data = null) {
    if (import.meta.NODE_ENV === "development") {
      this.log("debug", message, data);
    }
  }
}

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = "MK") => {
  return `${currency} ${parseFloat(amount).toFixed(2)}`;
};

/**
 * Format date
 */
export const formatDate = (dateString, options = {}) => {
  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return new Date(dateString).toLocaleDateString("en-US", {
    ...defaultOptions,
    ...options,
  });
};

/**
 * Format date and time
 */
export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Generate random ID
 */
export const generateId = (length = 8) => {
  // Fix: Use slice instead of deprecated substr
  return Math.random()
    .toString(36)
    .slice(2, 2 + length);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  // Fix: Use slice instead of deprecated substr
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

/**
 * Get initial from name
 */
export const getInitials = (name) => {
  // Fix: Use slice instead of deprecated substr
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Calculate total price from items
 */
export const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};

/**
 * Group array by key
 */
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

/**
 * Sort array by key
 */
export const sortBy = (array, key, order = "asc") => {
  return array.sort((a, b) => {
    if (order === "asc") {
      return a[key] > b[key] ? 1 : -1;
    } else {
      return a[key] < b[key] ? 1 : -1;
    }
  });
};

/**
 * Filter array by search term
 */
export const filterBySearch = (array, searchTerm, fields = ["name"]) => {
  if (!searchTerm) return array;

  const term = searchTerm.toLowerCase();
  return array.filter((item) =>
    fields.some((field) => item[field]?.toLowerCase().includes(term))
  );
};

/**
 * Download file from blob
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Get status color
 */
export const getStatusColor = (status) => {
  const colors = {
    pending: "yellow",
    preparing: "blue",
    out_for_delivery: "purple",
    delivered: "green",
    cancelled: "red",
    active: "green",
    inactive: "red",
  };

  return colors[status] || "gray";
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Parse error message from API response
 */
export const parseErrorMessage = (error) => {
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.response?.data?.message) return error.response.data.message;
  return "An unexpected error occurred";
};
