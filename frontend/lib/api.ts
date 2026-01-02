export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.BASE_URL ||
  "http://localhost:8000/api/v1"

function getAccessToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

function getRefreshToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("refresh_token")
}

function setTokens(access: string, refresh?: string) {
  if (typeof window === "undefined") return
  localStorage.setItem("access_token", access)
  if (refresh) localStorage.setItem("refresh_token", refresh)
}

function clearTokens() {
  if (typeof window === "undefined") return
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
  localStorage.removeItem("user")
}

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken()
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData
  const headers: HeadersInit = {
    ...(options.headers || {}),
  }
  if (!isForm && !(headers as Record<string, string>)["Content-Type"]) {
    ;(headers as Record<string, string>)["Content-Type"] = "application/json"
  }
  if (token) {
    ;(headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  }
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`
  
  const response = await fetch(url, { ...options, headers })

  // Handle 401 (Unauthorized) - Attempt Refresh
  if (response.status === 401) {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      // No refresh token, or we are already on the login page/refreshing
      clearTokens()
      if (typeof window !== "undefined" && !window.location.pathname.includes("/auth/login")) {
        window.location.href = "/auth/login"
      }
      return response
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(() => {
          return apiFetch(path, options)
        })
        .catch(() => {
          return response
        })
    }

    isRefreshing = true

    try {
      const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        setTokens(data.access_token) // Typically returns { access_token: ... }
        processQueue(null, data.access_token)
        isRefreshing = false
        // Retry original request
        return apiFetch(path, options)
      } else {
        throw new Error("Refresh failed")
      }
    } catch (e) {
      processQueue(e, null)
      isRefreshing = false
      clearTokens()
      if (typeof window !== "undefined" && !window.location.pathname.includes("/auth/login")) {
        window.location.href = "/auth/login"
      }
      return response
    }
  }

  return response
}

export async function apiJson<T>(path: string, options: RequestInit = {}) {
  const res = await apiFetch(path, options)
  if (!res.ok) {
    let detail = "Request failed"
    try {
      const data = await res.json()
      if (data && data.detail) {
        detail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail)
      } else {
        detail = JSON.stringify(data)
      }
    } catch {}
    throw new Error(detail)
  }
  return res.json() as Promise<T>
}
