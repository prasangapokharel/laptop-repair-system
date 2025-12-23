import { useEffect, useState } from "react"
import { apiJson } from "@/lib/api"

export type DeviceModel = {
  id: number
  brand_id: number
  name: string
  device_type_id: number
  created_at: string
}

export function useDeviceModels() {
  const [data, setData] = useState<DeviceModel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await apiJson<DeviceModel[]>(`/devices/models`)
        if (!cancelled) setData(res)
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to load models"
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

export async function createDeviceModel(input: {
  brand_id: number
  name: string
  device_type_id: number
}) {
  return apiJson<DeviceModel>(`/devices/models`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateDeviceModel(
  id: number,
  input: Partial<{ brand_id: number; name: string; device_type_id: number }>
) {
  return apiJson<DeviceModel>(`/devices/models/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export async function deleteDeviceModel(id: number) {
  return apiJson<void>(`/devices/models/${id}`, {
    method: "DELETE",
  })
}
