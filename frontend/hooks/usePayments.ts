/**
 * Payments Management Hook
 * Provides functionality for fetching payments
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

export interface Payment {
  id: number
  order_id: number
  due_amount: string
  amount: string
  status: "Paid" | "Partial" | "Pending" | string
  payment_method: string | null
  transaction_id: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

interface PaymentsQuery {
  limit?: number
  offset?: number
  status?: string
  order_id?: number
}

interface CreatePaymentPayload {
  order_id: number
  amount: string
  payment_method?: string
  transaction_id?: string
}

interface UpdatePaymentPayload {
  amount?: string
  status?: string
  payment_method?: string
  transaction_id?: string
}

/**
 * Fetch payments with optional filters
 */
export function usePayments(query: PaymentsQuery = {}) {
  const { limit = 20, offset = 0, status, order_id } = query
  const [data, setData] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchPayments() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set("limit", String(limit))
        params.set("offset", String(offset))
        if (status) params.set("status", status)
        if (order_id) params.set("order_id", String(order_id))

        const path =
          params.toString()
            ? `${API_ENDPOINTS.PAYMENTS.LIST}?${params.toString()}`
            : API_ENDPOINTS.PAYMENTS.LIST

        const res = await api.get<Payment[]>(path)
        if (!cancelled) {
          setData(res)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load payments"
        if (!cancelled) {
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchPayments()

    return () => {
      cancelled = true
    }
  }, [limit, offset, status, order_id])

  return { data, loading, error }
}

/**
 * Create new payment
 */
export function useCreatePayment() {
  return useApiMutation<CreatePaymentPayload, Payment>(
    API_ENDPOINTS.PAYMENTS.CREATE
  )
}

/**
 * Update payment
 */
export function useUpdatePayment() {
  return useApiUpdate<UpdatePaymentPayload, Payment>(API_ENDPOINTS.PAYMENTS.LIST)
}

/**
 * Delete payment
 */
export function useDeletePayment() {
  return useApiDelete(API_ENDPOINTS.PAYMENTS.LIST)
}
