/**
 * Order Mutations Hook
 * Provides functions for creating, updating, and managing orders
 */

"use client"
import { useState, useCallback } from "react"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/config/api.config"

interface CreateOrderInput {
  device_id: number
  customer_id?: number | null
  problem_id?: number | null
  cost?: string
  discount?: string
  note?: string | null
  status?: string
  estimated_completion_date?: string | null
}

interface UpdateOrderInput extends Partial<CreateOrderInput> {
  status?: string
}

interface CreatedOrder {
  id: number
}

/**
 * Hook for order mutations (create, update, assign)
 */
export function useOrderMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createOrder = useCallback(
    async (input: CreateOrderInput): Promise<CreatedOrder> => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.post<CreatedOrder>(API_ENDPOINTS.ORDERS.CREATE, {
          device_id: input.device_id,
          customer_id: input.customer_id ?? null,
          problem_id: input.problem_id ?? null,
          cost: input.cost ?? "0.00",
          discount: input.discount ?? "0.00",
          note: input.note ?? null,
          status: input.status ?? "Pending",
          estimated_completion_date: input.estimated_completion_date ?? null,
        })
        return res
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create order"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const updateOrder = useCallback(
    async (id: number, input: UpdateOrderInput) => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.patch(API_ENDPOINTS.ORDERS.UPDATE(id), input)
        return res
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update order"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const assignOrder = useCallback(
    async (order_id: number, user_id: number) => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.post(API_ENDPOINTS.ASSIGNMENTS.CREATE, {
          order_id,
          user_id,
        })
        return res
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to assign order"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const deleteOrder = useCallback(
    async (id: number) => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.delete(API_ENDPOINTS.ORDERS.DELETE(id))
        return res
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete order"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { createOrder, updateOrder, assignOrder, deleteOrder, loading, error }
}
