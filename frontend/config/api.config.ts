/**
 * API Configuration
 * Centralized API endpoints and configuration for the frontend application
 */

// Determine base URL based on environment
const getBaseUrl = (): string => {
  if (typeof window === "undefined") {
    // Server-side (Next.js middleware, API routes, etc.)
    return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000/api/v1"
  }
  // Client-side
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000/api/v1"
}

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },

  // Users Management
  USERS: {
    LIST: "/users",
    CREATE: "/users",
    DETAIL: (id: string | number) => `/users/${id}`,
    UPDATE: (id: string | number) => `/users/${id}`,
    DELETE: (id: string | number) => `/users/${id}`,
    CHANGE_PASSWORD: (id: string | number) => `/users/${id}/change-password`,
    ASSIGN_ROLE: (id: string | number) => `/users/${id}/roles`,
  },

  // Devices
  DEVICES: {
    // Device Types
    DEVICE_TYPES: {
      LIST: "/devices/types",
      CREATE: "/devices/types",
      DETAIL: (id: string | number) => `/devices/types/${id}`,
      UPDATE: (id: string | number) => `/devices/types/${id}`,
      DELETE: (id: string | number) => `/devices/types/${id}`,
    },
    // Brands
    BRANDS: {
      LIST: "/devices/brands",
      CREATE: "/devices/brands",
      DETAIL: (id: string | number) => `/devices/brands/${id}`,
      UPDATE: (id: string | number) => `/devices/brands/${id}`,
      DELETE: (id: string | number) => `/devices/brands/${id}`,
    },
    // Models
    MODELS: {
      LIST: "/devices/models",
      CREATE: "/devices/models",
      DETAIL: (id: string | number) => `/devices/models/${id}`,
      UPDATE: (id: string | number) => `/devices/models/${id}`,
      DELETE: (id: string | number) => `/devices/models/${id}`,
    },
    // Devices
    LIST: "/devices",
    CREATE: "/devices",
    DETAIL: (id: string | number) => `/devices/${id}`,
    UPDATE: (id: string | number) => `/devices/${id}`,
    DELETE: (id: string | number) => `/devices/${id}`,
  },

  // Orders
  ORDERS: {
    LIST: "/orders",
    CREATE: "/orders",
    DETAIL: (id: string | number) => `/orders/${id}`,
    UPDATE: (id: string | number) => `/orders/${id}`,
    DELETE: (id: string | number) => `/orders/${id}`,
  },

  // Payments
  PAYMENTS: {
    LIST: "/payments",
    CREATE: "/payments",
    DETAIL: (id: string | number) => `/payments/${id}`,
    UPDATE: (id: string | number) => `/payments/${id}`,
    DELETE: (id: string | number) => `/payments/${id}`,
  },

  // Assignments
  ASSIGNMENTS: {
    LIST: "/assigns",
    CREATE: "/assigns",
    DETAIL: (id: string | number) => `/assigns/${id}`,
    DELETE: (id: string | number) => `/assigns/${id}`,
  },

  // Problems
  PROBLEMS: {
    LIST: "/problems",
    CREATE: "/problems",
    DETAIL: (id: string | number) => `/problems/${id}`,
    UPDATE: (id: string | number) => `/problems/${id}`,
    DELETE: (id: string | number) => `/problems/${id}`,
  },

  // Cost Settings
  COST_SETTINGS: {
    LIST: "/cost-settings",
    CREATE: "/cost-settings",
    DETAIL: (id: string | number) => `/cost-settings/${id}`,
    UPDATE: (id: string | number) => `/cost-settings/${id}`,
    DELETE: (id: string | number) => `/cost-settings/${id}`,
  },

  // Messages
  MESSAGES: "/messages",

  // Admin Dashboard
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
  },
} as const

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  RECEPTIONIST: "receptionist",
  TECHNICIAN: "technician",
  ACCOUNTANT: "accountant",
  CUSTOMER: "customer",
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

// Token Storage Keys
export const TOKEN_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "Please log in to continue.",
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  TIMEOUT: "Request timed out. Please try again.",
  INVALID_CREDENTIALS: "Invalid phone number or password.",
  INVALID_TOKEN: "Invalid or expired token. Please log in again.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
} as const
