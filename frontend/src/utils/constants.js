/**
 * Application constants and configuration
 */

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify'
  },
  USERS: {
    BASE: '/users',
    BY_ROLE: '/users/role'
  },
  MEALS: {
    BASE: '/meals',
    AVAILABLE: '/meals-available',
    CATEGORIES: '/categories'
  },
  ORDERS: {
    BASE: '/orders',
    STATUS: '/orders/:id/status'
  },
  REPORTS: {
    BASE: '/reports',
    EXPORT: '/reports/export'
  }
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES: 'sales',
  CUSTOMER: 'customer'
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Order Status Display
export const ORDER_STATUS_DISPLAY = {
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.PREPARING]: 'Preparing',
  [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Out for Delivery',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled'
};

// Order Status Flow
export const ORDER_STATUS_FLOW = {
  [ORDER_STATUS.PENDING]: ORDER_STATUS.PREPARING,
  [ORDER_STATUS.PREPARING]: ORDER_STATUS.OUT_FOR_DELIVERY,
  [ORDER_STATUS.OUT_FOR_DELIVERY]: ORDER_STATUS.DELIVERED
};

// Validation Rules
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100
  },
  EMAIL: {
    PATTERN: /^\S+@\S+\.\S+$/
  },
  PASSWORD: {
    MIN_LENGTH: 6
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15
  }
};

// Application Settings
export const APP_SETTINGS = {
  CART: {
    STORAGE_KEY: 'cart',
    MAX_QUANTITY: 10
  },
  ORDERS: {
    AUTO_REFRESH_INTERVAL: 30000 // 30 seconds
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50
  }
};

// Export Formats
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  REGISTER: 'Registration successful!',
  ORDER_CREATED: 'Order placed successfully!',
  ORDER_UPDATED: 'Order updated successfully!',
  USER_CREATED: 'User created successfully!',
  MEAL_CREATED: 'Meal added successfully!',
  REPORT_GENERATED: 'Report generated successfully!'
};