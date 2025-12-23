import { useEffect, useState } from "react"
import { apiJson } from "@/lib/api"

export type DeviceBrand = {
  id: number
  name: string
  created_at: string
}

export function useDeviceBrands() {
  const [data, setData] = useState<DeviceBrand[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await apiJson<DeviceBrand[]>(`/devices/brands`)
        if (!cancelled) setData(res)
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to load brands"
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

export async function createDeviceBrand(input: { name: string }) {
  return apiJson<DeviceBrand>(`/devices/brands`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateDeviceBrand(id: number, input: { name: string }) {
  return apiJson<DeviceBrand>(`/devices/brands/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export async function deleteDeviceBrand(id: number) {
  return apiJson<void>(`/devices/brands/${id}`, {
    method: "DELETE",
  })
}
