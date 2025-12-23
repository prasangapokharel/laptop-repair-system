import { useCallback, useEffect, useState } from "react"
import { apiJson } from "@/lib/api"

type LoginResponse = {
  user: {
    id: number
    full_name: string
    phone: string
    email: string | null
    profile_picture: string | null
    role: { id: number; name: string } | null
    is_active: boolean
    is_staff: boolean
    created_at: string
  }
  tokens: {
    access_token: string
    refresh_token: string
    token_type: "bearer"
  }
}

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<LoginResponse["user"] | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    const cached = localStorage.getItem("user")
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as LoginResponse["user"]
        setUser(parsed)
      } catch {}
    }
    if (!token) return
  }, [])

  const login = useCallback(async (phone: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiJson<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone, password }),
      })
      localStorage.setItem("access_token", data.tokens.access_token)
      localStorage.setItem("refresh_token", data.tokens.refresh_token)
      localStorage.setItem("user", JSON.stringify(data.user))
      setUser(data.user)
      return data.user
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Login failed"
      setError(message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    const refresh_token = localStorage.getItem("refresh_token")
    if (refresh_token) {
      try {
        await apiJson("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refresh_token }),
        })
      } catch {}
    }
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    setUser(null)
  }, [])

  return { login, logout, loading, error, user }
}
