/**
 * Users Management Hook
 * Provides functionality for fetching, creating, updating, and deleting users
 */

"use client"
import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/config/api.config"
import {
  useApiMutation,
  useApiUpdate,
  useApiDelete,
} from "@/hooks/useApi"

export interface User {
  id: number
  full_name: string
  phone: string
  email: string | null
  profile_picture: string | null
  is_active: boolean
  is_staff: boolean
  created_at: string
  role?: {
    id: number
    name: string
    description?: string
    created_at?: string
  } | null
}

export interface UserListResponse {
  items: User[]
  total: number
  page: number
  limit: number
}

interface CreateUserPayload {
  full_name: string
  phone: string
  email?: string
  password: string
  is_active?: boolean
  is_staff?: boolean
}

interface UpdateUserPayload {
  full_name?: string
  email?: string
  profile_picture?: string
  is_active?: boolean
  is_staff?: boolean
}

/**
 * Fetch users with optional filters and pagination
 */
export function useUsers(limit = 10, offset = 0, roleName?: string) {
  const [data, setData] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function fetchUsers() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set("limit", String(limit))
        params.set("offset", String(offset))
        if (roleName) {
          params.set("role_name", roleName)
        }

        const path =
          params.toString()
            ? `${API_ENDPOINTS.USERS.LIST}?${params.toString()}`
            : API_ENDPOINTS.USERS.LIST

        const res = await api.get<UserListResponse>(path)
        if (!cancelled) {
          setData(res.items)
          setTotal(res.total)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load users"
        if (!cancelled) {
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchUsers()

    return () => {
      cancelled = true
    }
  }, [limit, offset, roleName, refreshKey])

  return { data, total, loading, error, refetch }
}

/**
 * Create new user
 */
export function useCreateUser() {
  return useApiMutation<CreateUserPayload, User>(API_ENDPOINTS.USERS.CREATE)
}

/**
 * Update user
 */
export function useUpdateUser() {
  return useApiUpdate<UpdateUserPayload, User>(API_ENDPOINTS.USERS.LIST)
}

/**
 * Delete user
 */
export function useDeleteUser() {
  return useApiDelete(API_ENDPOINTS.USERS.LIST)
}
