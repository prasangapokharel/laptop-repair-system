/**
 * Device Types Hook
 * Provides functionality for fetching, creating, updating, and deleting device types
 */

"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/config/api.config"
import { useApiMutation, useApiUpdate, useApiDelete } from "@/hooks/useApi"

export interface DeviceType {
  id: number
  name: string
  description: string
  created_at: string
}

interface CreateTypePayload {
  name: string
  description: string
}

interface UpdateTypePayload {
  name?: string
  description?: string
}

/**
 * Fetch all device types
 */
export function useDeviceTypes() {
  const [data, setData] = useState<DeviceType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchTypes() {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get<DeviceType[]>(API_ENDPOINTS.DEVICES.DEVICE_TYPES.LIST)
        if (!cancelled) {
          setData(res)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load device types"
        if (!cancelled) {
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchTypes()

    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}

/**
 * Create new device type
 */
export function useCreateDeviceType() {
  return useApiMutation<CreateTypePayload, DeviceType>(
    API_ENDPOINTS.DEVICES.DEVICE_TYPES.CREATE
  )
}

/**
 * Update device type
 */
export function useUpdateDeviceType() {
  return useApiUpdate<UpdateTypePayload, DeviceType>(
    API_ENDPOINTS.DEVICES.DEVICE_TYPES.LIST
  )
}

/**
 * Delete device type
 */
export function useDeleteDeviceType() {
  return useApiDelete(API_ENDPOINTS.DEVICES.DEVICE_TYPES.LIST)
}
