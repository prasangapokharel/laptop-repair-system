import { useEffect, useState } from "react"
import { apiJson } from "@/lib/api"
import type { Payment } from "./usePayments"

export function usePaymentDetail(id: number) {
  const [data, setData] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await apiJson<Payment>(`/payments/${id}`)
        if (!cancelled) setData(res)
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to load payment"
        if (!cancelled) setError(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [id])

  return { data, loading, error }
}
