import { useEffect, useState } from "react"
import { apiJson } from "@/lib/api"

export type User = {
  id: number
  full_name: string
  phone: string
  email: string | null
  profile_picture: string | null
  is_active: boolean
  is_staff: boolean
  created_at: string
  role?: { id: number; name: string; description?: string; created_at?: string } | null
}

export type UserListResponse = {
  items: User[]
  total: number
  page: number
  limit: number
}

export function useUsers(limit = 10, offset = 0, roleName?: string) {
  const [data, setData] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = () => setRefreshKey((prev) => prev + 1)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        let url = `/users?limit=${limit}&offset=${offset}`
        if (roleName) {
          url += `&role_name=${encodeURIComponent(roleName)}`
        }
        const res = await apiJson<UserListResponse>(url)
        if (!cancelled) {
          setData(res.items)
          setTotal(res.total)
        }
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to load users"
        if (!cancelled) setError(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [limit, offset, roleName, refreshKey])

  return { data, total, loading, error, refetch }
}
