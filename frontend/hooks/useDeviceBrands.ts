/**
 * Device Brands Hook
 * Provides functionality for fetching, creating, updating, and deleting device brands
 */

"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/config/api.config"
import { useApiMutation, useApiUpdate, useApiDelete } from "@/hooks/useApi"

export interface DeviceBrand {
  id: number
  name: string
  created_at: string
}

interface CreateBrandPayload {
  name: string
}

interface UpdateBrandPayload {
  name: string
}

/**
 * Fetch all device brands
 */
export function useDeviceBrands() {
  const [data, setData] = useState<DeviceBrand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchBrands() {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get<DeviceBrand[]>(API_ENDPOINTS.DEVICES.BRANDS.LIST)
        if (!cancelled) {
          setData(res)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load brands"
        if (!cancelled) {
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchBrands()

    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}

/**
 * Create new device brand
 */
export function useCreateDeviceBrand() {
  return useApiMutation<CreateBrandPayload, DeviceBrand>(
    API_ENDPOINTS.DEVICES.BRANDS.CREATE
  )
}

/**
 * Update device brand
 */
export function useUpdateDeviceBrand() {
  return useApiUpdate<UpdateBrandPayload, DeviceBrand>(
    API_ENDPOINTS.DEVICES.BRANDS.LIST
  )
}

/**
 * Delete device brand
 */
export function useDeleteDeviceBrand() {
  return useApiDelete(API_ENDPOINTS.DEVICES.BRANDS.LIST)
}

/**
 * Helper function to create a device brand (for use in forms)
 */
export async function createDeviceBrand(payload: CreateBrandPayload): Promise<DeviceBrand> {
  return await api.post<DeviceBrand>(API_ENDPOINTS.DEVICES.BRANDS.CREATE, payload)
}

/**
 * Helper function to update a device brand (for use in forms)
 */
export async function updateDeviceBrand(id: number, payload: UpdateBrandPayload): Promise<DeviceBrand> {
  return await api.patch<DeviceBrand>(API_ENDPOINTS.DEVICES.BRANDS.UPDATE(id), payload)
}

/**
 * Helper function to delete a device brand (for use in forms)
 */
export async function deleteDeviceBrand(id: number): Promise<void> {
  return await api.delete(API_ENDPOINTS.DEVICES.BRANDS.DELETE(id))
}
