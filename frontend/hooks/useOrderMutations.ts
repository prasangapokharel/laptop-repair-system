import { useState } from "react"
import { apiJson } from "@/lib/api"

type CreateOrderInput = {
  device_id: number
  customer_id?: number | null
  problem_id?: number | null
  cost?: string
  discount?: string
  note?: string | null
  status?: string
  estimated_completion_date?: string | null
}

type UpdateOrderInput = Partial<CreateOrderInput> & { status?: string }

type CreatedOrder = { id: number }

export function useOrderMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function createOrder(input: CreateOrderInput): Promise<CreatedOrder> {
    setLoading(true)
    setError(null)
    try {
      const res = await apiJson<CreatedOrder>(`/orders`, {
        method: "POST",
        body: JSON.stringify({
          device_id: input.device_id,
          customer_id: input.customer_id ?? null,
          problem_id: input.problem_id ?? null,
          cost: input.cost ?? "0.00",
          discount: input.discount ?? "0.00",
          note: input.note ?? null,
          status: input.status ?? "Pending",
          estimated_completion_date: input.estimated_completion_date ?? null,
        }),
      })
      return res
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to create order"
      setError(message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  async function updateOrder(id: number, input: UpdateOrderInput) {
    setLoading(true)
    setError(null)
    try {
      const res = await apiJson(`/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      })
      return res
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to update order"
      setError(message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  async function assignOrder(order_id: number, user_id: number) {
    setLoading(true)
    setError(null)
    try {
      const res = await apiJson(`/orders/assign`, {
        method: "POST",
        body: JSON.stringify({ order_id, user_id }),
      })
      return res
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to assign order"
      setError(message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { createOrder, updateOrder, assignOrder, loading, error }
}
