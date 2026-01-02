/**
 * Payment Detail Hook
 * Fetches a single payment by ID
 */

"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/config/api.config"
import type { Payment } from "./usePayments"

/**
 * Fetch single payment by ID
 */
export function usePaymentDetail(id: number) {
  const [data, setData] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function fetchPayment() {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get<Payment>(API_ENDPOINTS.PAYMENTS.DETAIL(id))
        if (!cancelled) {
          setData(res)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load payment"
        if (!cancelled) {
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchPayment()

    return () => {
      cancelled = true
    }
  }, [id])

  return { data, loading, error }
}
