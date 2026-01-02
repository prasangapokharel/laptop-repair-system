// API Client - Clean, Type-Safe, Production-Ready
import { API_CONFIG } from "@/config/api.config"

/**
 * API Response Types
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  statusCode: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

/**
 * Token Management
 */
class TokenManager {
  private static instance: TokenManager

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  getAccessToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("access_token")
  }

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("refresh_token")
  }

  setTokens(accessToken: string, refreshToken?: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem("access_token", accessToken)
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken)
    }
  }

  clearTokens(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
  }

  isTokenValid(): boolean {
    return this.getAccessToken() !== null
  }
}

/**
 * API Client - Handles all HTTP requests with authentication
 */
class ApiClient {
  private static instance: ApiClient
  private tokenManager = TokenManager.getInstance()
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value: unknown) => void
    reject: (reason?: unknown) => void
  }> = []

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: unknown, token: string | null = null): void {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error)
      } else {
        prom.resolve(token)
      }
    })
    this.failedQueue = []
  }

  /**
   * Handle token refresh
   */
  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.tokenManager.getRefreshToken()
    if (!refreshToken) {
      this.tokenManager.clearTokens()
      this.redirectToLogin()
      return false
    }

    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject })
      })
        .then(() => true)
        .catch(() => false)
    }

    this.isRefreshing = true

     try {
       const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ refresh_token: refreshToken }),
       })

      if (response.ok) {
        const data = await response.json()
        const newAccessToken = data.access_token || data.tokens?.access_token
        if (newAccessToken) {
          this.tokenManager.setTokens(newAccessToken)
          this.processQueue(null, newAccessToken)
          this.isRefreshing = false
          return true
        }
      }
      throw new Error("Token refresh failed")
    } catch (error) {
      this.processQueue(error, null)
      this.isRefreshing = false
      this.tokenManager.clearTokens()
      this.redirectToLogin()
      return false
    }
  }

  /**
   * Redirect to login page
   */
  private redirectToLogin(): void {
    if (typeof window !== "undefined" && !window.location.pathname.includes("/auth/login")) {
      window.location.href = "/auth/login"
    }
  }

  /**
   * Build request headers with authentication
   */
  private buildHeaders(headers: Record<string, string> = {}): HeadersInit {
    const accessToken = this.tokenManager.getAccessToken()
    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    }

    if (accessToken) {
      defaultHeaders["Authorization"] = `Bearer ${accessToken}`
    }

    return defaultHeaders
  }

  /**
   * Make HTTP request with automatic retry on 401
   */
   async request<T>(
     path: string,
     options: RequestInit & { retryCount?: number } = {}
   ): Promise<Response> {
     const { retryCount = 0, ...fetchOptions } = options
     const url = `${API_CONFIG.BASE_URL}${path.startsWith("/") ? path : `/${path}`}`

    const isFormData = typeof FormData !== "undefined" && fetchOptions.body instanceof FormData
    const headers = isFormData
      ? { Authorization: `Bearer ${this.tokenManager.getAccessToken() || ""}` }
      : this.buildHeaders(fetchOptions.headers as Record<string, string>)

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    // Handle 401 Unauthorized
    if (response.status === 401 && retryCount < 1) {
      const refreshed = await this.refreshAccessToken()
      if (refreshed) {
        return this.request(path, { ...options, retryCount: retryCount + 1 })
      }
      return response
    }

    return response
  }

  /**
   * GET request
   */
  async get<T>(path: string): Promise<T> {
    const response = await this.request(path, { method: "GET" })
    return this.handleResponse<T>(response)
  }

  /**
   * POST request
   */
  async post<T>(path: string, data?: unknown): Promise<T> {
    const response = await this.request(path, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
    return this.handleResponse<T>(response)
  }

  /**
   * PATCH request
   */
  async patch<T>(path: string, data?: unknown): Promise<T> {
    const response = await this.request(path, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
    return this.handleResponse<T>(response)
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string): Promise<T> {
    const response = await this.request(path, { method: "DELETE" })
    if (response.status === 204) {
      return { success: true } as T
    }
    return this.handleResponse<T>(response)
  }

   /**
    * Upload file (FormData)
    */
   async uploadFile<T>(path: string, file: File, additionalData?: Record<string, string>): Promise<T> {
     const formData = new FormData()
     formData.append("file", file)

     if (additionalData) {
       Object.entries(additionalData).forEach(([key, value]) => {
         formData.append(key, value)
       })
     }

     const response = await this.request(path, {
       method: "POST",
       body: formData,
     })
     return this.handleResponse<T>(response)
   }

   /**
    * Set access token directly (for manual token management)
    */
   setToken(token: string): void {
     this.tokenManager.setTokens(token)
   }

   /**
    * Clear tokens (for logout)
    */
   clearToken(): void {
     this.tokenManager.clearTokens()
   }

   /**
    * Handle API response
    */
   private async handleResponse<T>(response: Response): Promise<T> {
     if (!response.ok) {
       let errorMessage = `HTTP ${response.status}`
       try {
         const data = await response.json()
         errorMessage = data.detail || data.message || errorMessage
       } catch {}
       throw new Error(errorMessage)
     }

     if (response.status === 204) {
       return {} as T
     }

     try {
       return await response.json()
     } catch {
       return {} as T
     }
   }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance()

// Export convenience functions
export const api = {
  get: <T,>(path: string) => apiClient.get<T>(path),
  post: <T,>(path: string, data?: unknown) => apiClient.post<T>(path, data),
  patch: <T,>(path: string, data?: unknown) => apiClient.patch<T>(path, data),
  delete: <T,>(path: string) => apiClient.delete<T>(path),
  upload: <T,>(path: string, file: File, data?: Record<string, string>) =>
    apiClient.uploadFile<T>(path, file, data),
  setToken: (token: string) => apiClient.setToken(token),
  clearToken: () => apiClient.clearToken(),
  tokenManager: TokenManager.getInstance(),
}
