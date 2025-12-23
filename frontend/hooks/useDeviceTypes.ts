import { useEffect, useState } from "react"
import { apiJson } from "@/lib/api"

export type DeviceType = {
  id: number
  name: string
  description: string
  created_at: string
}

export function useDeviceTypes() {
  const [data, setData] = useState<DeviceType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await apiJson<DeviceType[]>(`/devices/types`)
        if (!cancelled) setData(res)
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to load device types"
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

export async function createDeviceType(input: {
  name: string
  description: string
}) {
  return apiJson<DeviceType>(`/devices/types`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateDeviceType(
  id: number,
  input: Partial<{ name: string; description: string }>
) {
  return apiJson<DeviceType>(`/devices/types/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export async function deleteDeviceType(id: number) {
  return apiJson<void>(`/devices/types/${id}`, {
    method: "DELETE",
  })
}
