import { useEffect, useState } from "react"
import { apiJson } from "@/lib/api"

export type Problem = {
  id: number
  device_type_id: number
  name: string
  description: string | null
  created_at: string
  device_type?: {
    id: number
    name: string
  }
}

export type ProblemListResponse = {
  items: Problem[]
  total: number
  page: number
  limit: number
}

export function useProblems(limit = 10, offset = 0, device_type_id?: number) {
  const [data, setData] = useState<Problem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.append("limit", String(limit))
        params.append("offset", String(offset))
        if (device_type_id) params.append("device_type_id", String(device_type_id))
        
        const res = await apiJson<ProblemListResponse>(
          `/problems?${params.toString()}`
        )
        if (!cancelled) {
          setData(res.items)
          setTotal(res.total)
        }
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to load problems"
        if (!cancelled) setError(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [limit, offset, device_type_id])

  return { data, total, loading, error }
}

export function useProblem(id: number | null) {
  const [data, setData] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await apiJson<Problem>(`/problems/${id}`)
        if (!cancelled) {
          setData(res)
        }
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to load problem"
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

export function useProblemMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function createProblem(data: {
    device_type_id: number
    name: string
    description?: string
  }) {
    setLoading(true)
    setError(null)
    try {
      const res = await apiJson<Problem>("/problems", {
        method: "POST",
        body: JSON.stringify(data),
      })
      return res
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create problem")
      throw e
    } finally {
      setLoading(false)
    }
  }

  async function updateProblem(
    id: number,
    data: {
      device_type_id?: number
      name?: string
      description?: string
    }
  ) {
    setLoading(true)
    setError(null)
    try {
      const res = await apiJson<Problem>(`/problems/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      })
      return res
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update problem")
      throw e
    } finally {
      setLoading(false)
    }
  }

  async function deleteProblem(id: number) {
    setLoading(true)
    setError(null)
    try {
      await apiJson(`/problems/${id}`, {
        method: "DELETE",
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete problem")
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { createProblem, updateProblem, deleteProblem, loading, error }
}
