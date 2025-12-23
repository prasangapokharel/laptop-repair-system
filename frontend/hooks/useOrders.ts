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
}

type OrderListResponse = {
  items: Order[]
  total: number
  page: number
  limit: number
}

export function useOrders(filters?: {
  status?: string
  customer_id?: number
  limit?: number
  offset?: number
}) {
  const [data, setData] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (filters?.status) params.append("status", filters.status)
        if (filters?.customer_id)
          params.append("customer_id", String(filters.customer_id))
        if (filters?.limit) params.append("limit", String(filters.limit))
        if (filters?.offset) params.append("offset", String(filters.offset))
        
        const res = await apiJson<OrderListResponse>(`/orders?${params.toString()}`)
        setData(res.items)
        setTotal(res.total)
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to load orders"
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)])

  return { data, total, loading, error }
}
