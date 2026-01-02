/**
 * Roles Hook
 * Provides functionality for fetching and managing user roles
 */

"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/config/api.config"

export interface Role {
  id: number
  name: string
  description: string
  created_at: string
}

/**
 * Fetch all user roles
 */
export function useRoles() {
  const [data, setData] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchRoles() {
      setLoading(true)
      setError(null)
      try {
        // Note: This endpoint might not be in API_ENDPOINTS, using direct path
        const res = await api.get<Role[]>("/users/roles")
        if (!cancelled) {
          setData(res)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load roles"
        if (!cancelled) {
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchRoles()

    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}

/**
 * Create new role
 */
export async function createRole(input: { name: string; description?: string }): Promise<Role> {
  return api.post<Role>("/users/roles", input)
}

/**
 * Assign role to user
 */
export async function assignRole(user_id: number, role_id: number): Promise<void> {
  return api.post("/users/roles/enroll", { user_id, role_id })
}
