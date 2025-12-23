import { useEffect, useState } from "react"
import { apiJson } from "@/lib/api"

type Order = {
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
  updated_at: string
}

export function useOrderDetail(id?: number) {
  const [data, setData] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await apiJson<Order>(`/orders/${id}`)
        setData(res)
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to load order"
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  return { data, loading, error }
}
