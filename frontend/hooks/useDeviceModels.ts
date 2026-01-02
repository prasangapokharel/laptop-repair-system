/**
 * Device Models Hook
 * Provides functionality for fetching, creating, updating, and deleting device models
 */

"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/config/api.config"
import { useApiMutation, useApiUpdate, useApiDelete } from "@/hooks/useApi"

export interface DeviceModel {
  id: number
  brand_id: number
  name: string
  device_type_id: number
  created_at: string
}

interface CreateModelPayload {
  brand_id: number
  name: string
  device_type_id: number
}

interface UpdateModelPayload {
  brand_id?: number
  name?: string
  device_type_id?: number
}

/**
 * Fetch all device models
 */
export function useDeviceModels() {
  const [data, setData] = useState<DeviceModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchModels() {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get<DeviceModel[]>(API_ENDPOINTS.DEVICES.MODELS.LIST)
        if (!cancelled) {
          setData(res)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load models"
        if (!cancelled) {
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchModels()

    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}

/**
 * Create new device model
 */
export function useCreateDeviceModel() {
  return useApiMutation<CreateModelPayload, DeviceModel>(
    API_ENDPOINTS.DEVICES.MODELS.CREATE
  )
}

/**
 * Update device model
 */
export function useUpdateDeviceModel() {
  return useApiUpdate<UpdateModelPayload, DeviceModel>(
    API_ENDPOINTS.DEVICES.MODELS.LIST
  )
}

/**
 * Delete device model
 */
export function useDeleteDeviceModel() {
  return useApiDelete(API_ENDPOINTS.DEVICES.MODELS.LIST)
}
