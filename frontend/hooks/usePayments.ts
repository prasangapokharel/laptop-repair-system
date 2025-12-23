import { useEffect, useState } from "react"
import { apiJson } from "@/lib/api"

export type Payment = {
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

type PaymentsQuery = {
  limit?: number
  offset?: number
  status?: string
  order_id?: number
}

export function usePayments(query: PaymentsQuery = {}) {
  const { limit = 20, offset = 0, status, order_id } = query
  const [data, setData] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set("limit", String(limit))
        params.set("offset", String(offset))
        if (status) params.set("status", status)
        if (order_id) params.set("order_id", String(order_id))
        const res = await apiJson<Payment[]>(`/payments?${params.toString()}`)
        if (!cancelled) setData(res)
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to load payments"
        if (!cancelled) setError(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [limit, offset, status, order_id])

  return { data, loading, error }
}
