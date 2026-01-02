/**
 * Device List Hook
 * Provides functionality for fetching devices
 */

"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/config/api.config"

export interface Device {
  id: number
  brand_id: number
  model_id: number
  device_type_id: number
  serial_number: string | null
  brand?: {
    id: number
    name: string
  }
  model?: {
    id: number
    name: string
  }
  device_type?: {
    id: number
    name: string
  }
}

interface DeviceListResponse {
  items: Device[]
  total: number
  page: number
  limit: number
}

interface DeviceFilters {
  limit?: number
  offset?: number
}

/**
 * Fetch devices with pagination
 */
export function useDeviceList(limit = 50, offset = 0, filters?: DeviceFilters) {
  const [data, setData] = useState<Device[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchDevices = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.append("limit", String(filters?.limit || limit))
        params.append("offset", String(filters?.offset || offset))
        
        const path = `${API_ENDPOINTS.DEVICES.LIST}?${params.toString()}`
        const res = await api.get<DeviceListResponse>(path)
        if (!cancelled) {
          setData(res.items)
          setTotal(res.total)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load devices"
        if (!cancelled) {
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchDevices()

    return () => {
      cancelled = true
    }
  }, [limit, offset, filters])

  return { data, total, loading, error }
}
