/**
 * Order Detail Hook
 * Fetches a single order by ID
 */

"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/config/api.config"

export interface Order {
  id: number
  device_id: number
  device_name?: string | null
  customer_id: number | null
  customer_name?: string | null
  problem_id: number | null
  problem_name?: string | null
  cost: string
  discount: string
  total_cost: string
  note: string | null
  status: string
  estimated_completion_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Fetch single order by ID
 */
export function useOrderDetail(id?: number) {
  const [data, setData] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    const fetchOrder = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get<Order>(API_ENDPOINTS.ORDERS.DETAIL(id))
        if (!cancelled) {
          setData(res)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load order"
        if (!cancelled) {
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchOrder()

    return () => {
      cancelled = true
    }
  }, [id])

  return { data, loading, error }
}
