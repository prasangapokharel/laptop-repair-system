/**
 * User Detail Hook
 * Fetches a single user by ID
 */

"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/config/api.config"
import type { User } from "./useUsers"

/**
 * Fetch single user by ID
 */
export function useUserDetail(id: number) {
  const [data, setData] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function fetchUser() {
      setLoading(true)
      setError(null)
      try {
        const user = await api.get<User>(API_ENDPOINTS.USERS.DETAIL(id))
        if (!cancelled) {
          setData(user)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load user"
        if (!cancelled) {
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchUser()

    return () => {
      cancelled = true
    }
  }, [id])

  return { data, loading, error }
}
