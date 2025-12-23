import { useEffect, useState } from "react"
import { apiJson } from "@/lib/api"
import type { User } from "./useUsers"

export function useUserDetail(id: number) {
  const [data, setData] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const user = await apiJson<User>(`/users/${id}`)
        if (!cancelled) setData(user)
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to load user"
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
