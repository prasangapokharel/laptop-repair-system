import { useState } from "react"
import { apiJson } from "@/lib/api"
import type { Payment } from "./usePayments"

type CreatePaymentInput = {
  order_id: number
  due_amount: string
  amount: string
  status: string
  payment_method?: string | null
  transaction_id?: string | null
}

type UpdatePaymentInput = Partial<CreatePaymentInput>

export function usePaymentMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function createPayment(input: CreatePaymentInput) {
    setLoading(true)
    setError(null)
    try {
      const res = await apiJson<Payment>(`/payments`, {
        method: "POST",
        body: JSON.stringify(input),
      })
      return res
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to create payment"
      setError(message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  async function updatePayment(id: number, input: UpdatePaymentInput) {
    setLoading(true)
    setError(null)
    try {
      const res = await apiJson<Payment>(`/payments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      })
      return res
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to update payment"
      setError(message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  async function deletePayment(id: number) {
    setLoading(true)
    setError(null)
    try {
      await apiJson<void>(`/payments/${id}`, {
        method: "DELETE",
      })
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to delete payment"
      setError(message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { createPayment, updatePayment, deletePayment, loading, error }
}
