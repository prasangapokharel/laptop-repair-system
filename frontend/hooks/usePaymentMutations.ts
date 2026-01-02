/**
 * Payment Mutations Hook
 * Provides functions for creating, updating, and deleting payments
 */

"use client"
import { useState, useCallback } from "react"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/config/api.config"
import type { Payment } from "./usePayments"

interface CreatePaymentInput {
  order_id: number
  due_amount: string
  amount: string
  status: string
  payment_method?: string | null
  transaction_id?: string | null
}

interface UpdatePaymentInput extends Partial<CreatePaymentInput> {}

/**
 * Hook for payment mutations (create, update, delete)
 */
export function usePaymentMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPayment = useCallback(
    async (input: CreatePaymentInput): Promise<Payment> => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.post<Payment>(API_ENDPOINTS.PAYMENTS.CREATE, input)
        return res
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create payment"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const updatePayment = useCallback(
    async (id: number, input: UpdatePaymentInput): Promise<Payment> => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.patch<Payment>(
          API_ENDPOINTS.PAYMENTS.UPDATE(id),
          input
        )
        return res
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update payment"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const deletePayment = useCallback(async (id: number): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(API_ENDPOINTS.PAYMENTS.DELETE(id))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete payment"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { createPayment, updatePayment, deletePayment, loading, error }
}
