"use client"
import { useEffect, useState } from "react"
import { apiJson } from "@/lib/api"

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

export function useAdminDashboard() {
  const [data, setData] = useState<AdminDashboardStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await apiJson<AdminDashboardStats>("/admin/dashboard")
        if (!cancelled) setData(res)
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load dashboard"
        if (!cancelled) setError(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}

