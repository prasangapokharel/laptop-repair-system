/**
 * Cost Settings Management Hook
 * Provides functionality for fetching, creating, updating, and deleting cost settings
 */

"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/config/api.config"
import { useApiMutation, useApiUpdate, useApiDelete } from "@/hooks/useApi"

export interface CostSetting {
  id: number
  device_type_id: number
  problem_id: number
  cost: string | number
  description?: string
  created_at: string
  device_type?: {
    id: number
    name: string
  }
  problem?: {
    id: number
    name: string
  }
}

interface CreateCostSettingPayload {
  device_type_id: number
  problem_id: number
  cost: string | number
  description?: string
}

interface UpdateCostSettingPayload {
  device_type_id?: number
  problem_id?: number
  cost?: string | number
  description?: string
}

/**
 * Fetch all cost settings
 */
export function useCostSettings() {
  const [data, setData] = useState<CostSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchCostSettings() {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get<CostSetting[]>(API_ENDPOINTS.COST_SETTINGS.LIST)
        if (!cancelled) {
          setData(res)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load cost settings"
        if (!cancelled) {
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchCostSettings()

    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}

/**
 * Create new cost setting
 */
export function useCreateCostSetting() {
  return useApiMutation<CreateCostSettingPayload, CostSetting>(
    API_ENDPOINTS.COST_SETTINGS.CREATE
  )
}

/**
 * Update cost setting
 */
export function useUpdateCostSetting() {
  return useApiUpdate<UpdateCostSettingPayload, CostSetting>(
    API_ENDPOINTS.COST_SETTINGS.LIST
  )
}

/**
 * Delete cost setting
 */
export function useDeleteCostSetting() {
  return useApiDelete(API_ENDPOINTS.COST_SETTINGS.LIST)
}

/**
 * Helper function to create a cost setting (for use in forms)
 */
export async function createCostSetting(
  payload: CreateCostSettingPayload
): Promise<CostSetting> {
  return await api.post<CostSetting>(
    API_ENDPOINTS.COST_SETTINGS.CREATE,
    payload
  )
}

/**
 * Helper function to update a cost setting (for use in forms)
 */
export async function updateCostSetting(
  id: number,
  payload: UpdateCostSettingPayload
): Promise<CostSetting> {
  return await api.patch<CostSetting>(
    API_ENDPOINTS.COST_SETTINGS.UPDATE(id),
    payload
  )
}

/**
 * Helper function to delete a cost setting (for use in forms)
 */
export async function deleteCostSetting(id: number): Promise<void> {
  return await api.delete(API_ENDPOINTS.COST_SETTINGS.DELETE(id))
}
