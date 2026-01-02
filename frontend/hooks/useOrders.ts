/**
 * Orders Management Hook
 * Provides functionality for fetching, creating, updating, and deleting orders
 */

"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/config/api.config"
import {
  useApiMutation,
  useApiUpdate,
  useApiDelete,
} from "@/hooks/useApi"

export interface Order {
  id: number
  device_id: number
  customer_id: number | null
  problem_id: number | null
  cost: string
  discount: string
  total_cost: string
  note: string | null
  status: string
  estimated_completion_date: string | null
  completed_at: string | null
  created_at: string
  problem?: {
    id: number
    name: string
  }
}

interface OrderListResponse {
  items: Order[]
  total: number
  page: number
  limit: number
}

interface OrderFilters {
  status?: string
  customer_id?: number
  limit?: number
  offset?: number
}

interface CreateOrderPayload {
  device_id: number
  customer_id?: number
  problem_id?: number
  cost: string
  discount?: string
  estimated_completion_date?: string
  note?: string
}

interface UpdateOrderPayload {
  status?: string
  cost?: string
  discount?: string
  note?: string
  estimated_completion_date?: string
}

/**
 * Fetch orders with optional filters
 */
export function useOrders(filters?: OrderFilters) {
  const [data, setData] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (filters?.status) params.append("status", filters.status)
        if (filters?.customer_id)
          params.append("customer_id", String(filters.customer_id))
        if (filters?.limit) params.append("limit", String(filters.limit))
        if (filters?.offset) params.append("offset", String(filters.offset))

        const path =
          params.toString() 
            ? `${API_ENDPOINTS.ORDERS.LIST}?${params.toString()}`
            : API_ENDPOINTS.ORDERS.LIST

        const res = await api.get<OrderListResponse>(path)
        if (!cancelled) {
          setData(res.items)
          setTotal(res.total)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load orders"
        if (!cancelled) {
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchOrders()

    return () => {
      cancelled = true
    }
  }, [JSON.stringify(filters)])

  return { data, total, loading, error }
}

/**
 * Create new order
 */
export function useCreateOrder() {
  return useApiMutation<CreateOrderPayload, Order>(API_ENDPOINTS.ORDERS.CREATE)
}

/**
 * Update order
 */
export function useUpdateOrder() {
  return useApiUpdate<UpdateOrderPayload, Order>(API_ENDPOINTS.ORDERS.LIST)
}

/**
 * Delete order
 */
export function useDeleteOrder() {
  return useApiDelete(API_ENDPOINTS.ORDERS.LIST)
}
