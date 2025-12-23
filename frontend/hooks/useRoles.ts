import { useEffect, useState } from "react"
import { apiJson } from "@/lib/api"

export type Role = {
  id: number
  name: string
  description: string
  created_at: string
}

export function useRoles() {
  const [data, setData] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await apiJson<Role[]>(`/users/roles`)
        if (!cancelled) setData(res)
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to load roles"
        if (!cancelled) setError(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}

export async function createRole(input: { name: string; description?: string }) {
  return apiJson<Role>(`/users/roles`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function assignRole(user_id: number, role_id: number) {
  return apiJson<void>(`/users/roles/enroll`, {
    method: "POST",
    body: JSON.stringify({ user_id, role_id }),
  })
}
