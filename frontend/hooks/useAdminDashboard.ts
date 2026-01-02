/**
 * Admin Dashboard Hook
 * Fetches dashboard statistics and analytics data
 */

"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/config/api.config"

export type AdminDashboardStats = {
  users_count: number
  devices_count: number
  device_types_count: number
  brands_count: number
  models_count: number
  orders_count: number
  payments_count: number
  total_amount_paid: number
  total_amount_due: number
  chart_data: { date: string; orders: number; payments: number }[]
}

/**
 * Hook for fetching admin dashboard statistics
 * @returns Object with dashboard stats, loading state, and error
 */
export function useAdminDashboard() {
  const [data, setData] = useState<AdminDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchDashboard() {
      setLoading(true)
      setError(null)
      try {
        const stats = await api.get<AdminDashboardStats>(
          API_ENDPOINTS.ADMIN.DASHBOARD
        )
        if (!cancelled) {
          setData(stats)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load dashboard"
        if (!cancelled) {
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchDashboard()

    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}

