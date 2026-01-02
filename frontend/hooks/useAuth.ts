/**
 * Authentication Hook
 * Manages user authentication state, login, logout, and token management
 */

import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS, TOKEN_KEYS } from "@/config/api.config"

export type UserRole = "admin" | "receptionist" | "technician" | "accountant" | "customer"

export interface AuthUser {
  id: number
  full_name: string
  phone: string
  email: string | null
  profile_picture: string | null
  role: {
    id: number
    name: string
  } | null
  is_active: boolean
  is_staff: boolean
  created_at: string
}

interface LoginResponse {
  user: AuthUser
  tokens: {
    access_token: string
    refresh_token: string
    token_type: "bearer"
  }
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

interface AuthContextValue extends AuthState {
  login: (phone: string, password: string) => Promise<AuthUser>
  logout: () => Promise<void>
  register: (data: RegisterPayload) => Promise<AuthUser>
  refreshToken: () => Promise<boolean>
  clearError: () => void
}

interface RegisterPayload {
  full_name: string
  phone: string
  email?: string
  password: string
}

/**
 * Hook for managing authentication state and operations
 */
export function useAuth(): AuthContextValue {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  })

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN)
    const userStr = localStorage.getItem(TOKEN_KEYS.USER_DATA)

    if (userStr && token) {
      try {
        const user = JSON.parse(userStr) as AuthUser
        setState({
          user,
          isAuthenticated: true,
          loading: false,
          error: null,
        })
      } catch (err) {
        // Clear invalid data
        localStorage.removeItem(TOKEN_KEYS.USER_DATA)
        localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN)
      }
    }
  }, [])

  const login = useCallback(
    async (phone: string, password: string): Promise<AuthUser> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const response = await api.post<LoginResponse>(
          API_ENDPOINTS.AUTH.LOGIN,
          { phone, password }
        )

        // Store tokens and user data
        localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, response.tokens.access_token)
        localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, response.tokens.refresh_token)
        localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(response.user))

        // Update API client with new token
        api.setToken(response.tokens.access_token)

        setState({
          user: response.user,
          isAuthenticated: true,
          loading: false,
          error: null,
        })

        return response.user
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed"
        setState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: message,
        })
        throw err
      }
    },
    []
  )

  const register = useCallback(
    async (data: RegisterPayload): Promise<AuthUser> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const response = await api.post<LoginResponse>(
          API_ENDPOINTS.AUTH.REGISTER,
          data
        )

        // Store tokens and user data
        localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, response.tokens.access_token)
        localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, response.tokens.refresh_token)
        localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(response.user))

        // Update API client with new token
        api.setToken(response.tokens.access_token)

        setState({
          user: response.user,
          isAuthenticated: true,
          loading: false,
          error: null,
        })

        return response.user
      } catch (err) {
        const message = err instanceof Error ? err.message : "Registration failed"
        setState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: message,
        })
        throw err
      }
    },
    []
  )

  const logout = useCallback(async (): Promise<void> => {
    const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN)

    try {
      if (refreshToken) {
        try {
          await api.post(API_ENDPOINTS.AUTH.LOGOUT, {
            refresh_token: refreshToken,
          })
        } catch {
          // Logout from server failed, but continue with local logout
        }
      }
    } finally {
      // Clear all auth data
      localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(TOKEN_KEYS.USER_DATA)

      // Clear token from API client
      api.clearToken()

      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      })
    }
  }, [])

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const currentRefreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN)

    if (!currentRefreshToken) {
      return false
    }

    try {
      const response = await api.post<{ access_token: string }>(
        API_ENDPOINTS.AUTH.REFRESH,
        {
          refresh_token: currentRefreshToken,
        }
      )

      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, response.access_token)
      api.setToken(response.access_token)

      return true
    } catch (err) {
      // Refresh failed, logout user
      await logout()
      return false
    }
  }, [logout])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    clearError,
  }
}
