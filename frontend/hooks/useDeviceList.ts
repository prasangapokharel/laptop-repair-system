/**
 * Device Management Hook
 * Provides functionality for fetching, creating, updating, and deleting devices
 */

"use client"
import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/config/api.config"

export interface Device {
  id: number
  brand_id: number
  model_id: number
  device_type_id: number
  serial_number: string | null
  owner_id?: number | null
  notes?: string | null
  created_at?: string
  updated_at?: string
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
  owner_id?: number
}

interface CreateDevicePayload {
  brand_id: number
  model_id: number
  device_type_id: number
  serial_number: string
  owner_id?: number | null
  notes?: string
}

interface UpdateDevicePayload {
  brand_id?: number
  model_id?: number
  device_type_id?: number
  serial_number?: string
  owner_id?: number | null
  notes?: string
}

/**
 * Fetch devices with pagination and optional filters
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
        if (filters?.owner_id) params.append("owner_id", String(filters.owner_id))

        const path =
          params.toString()
            ? `${API_ENDPOINTS.DEVICES.LIST}?${params.toString()}`
            : API_ENDPOINTS.DEVICES.LIST

         const res = await api.get<Device[] | DeviceListResponse>(path)
         if (!cancelled) {
           // Handle both array response and paginated response
           if (Array.isArray(res)) {
             setData(res)
             setTotal(res.length)
           } else if (res && 'items' in res) {
             setData(res.items)
             setTotal(res.total || res.items.length)
           } else {
             setData([])
             setTotal(0)
           }
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
  }, [limit, offset, JSON.stringify(filters)])

  return { data, total, loading, error }
}

/**
 * Fetch single device by ID
 */
export function useDeviceDetail(id: number | null) {
  const [data, setData] = useState<Device | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    const fetchDevice = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get<Device>(API_ENDPOINTS.DEVICES.DETAIL(id as number))
        if (!cancelled) {
          setData(res)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load device"
        if (!cancelled) {
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchDevice()

    return () => {
      cancelled = true
    }
  }, [id])

  return { data, loading, error }
}

/**
 * Create new device
 */
export async function createDevice(payload: CreateDevicePayload): Promise<Device> {
  return await api.post<Device>(API_ENDPOINTS.DEVICES.CREATE, payload)
}

/**
 * Update device
 */
export async function updateDevice(id: number, payload: UpdateDevicePayload): Promise<Device> {
  return await api.patch<Device>(API_ENDPOINTS.DEVICES.UPDATE(id), payload)
}

/**
 * Delete device
 */
export async function deleteDevice(id: number): Promise<void> {
  return await api.delete(API_ENDPOINTS.DEVICES.DELETE(id))
}
