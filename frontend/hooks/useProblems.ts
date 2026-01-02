/**
 * Problems Management Hook
 * Provides functionality for fetching, creating, updating, and deleting problems
 */

"use client"
import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/config/api.config"
import {
  useApiMutation,
  useApiUpdate,
  useApiDelete,
} from "@/hooks/useApi"

export interface Problem {
  id: number
  device_type_id: number
  name: string
  description: string | null
  created_at: string
  updated_at?: string
  device_type?: {
    id: number
    name: string
  }
}

export interface ProblemListResponse {
  items: Problem[]
  total: number
  page: number
  limit: number
}

interface CreateProblemPayload {
  device_type_id: number
  name: string
  description?: string
}

interface UpdateProblemPayload {
  device_type_id?: number
  name?: string
  description?: string
}

/**
 * Fetch problems with optional filters
 */
export function useProblems(limit = 10, offset = 0, device_type_id?: number) {
  const [data, setData] = useState<Problem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchProblems() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.append("limit", String(limit))
        params.append("offset", String(offset))
        if (device_type_id) params.append("device_type_id", String(device_type_id))

        const path =
          params.toString()
            ? `${API_ENDPOINTS.PROBLEMS.LIST}?${params.toString()}`
            : API_ENDPOINTS.PROBLEMS.LIST

        const res = await api.get<ProblemListResponse>(path)
        if (!cancelled) {
          setData(res.items)
          setTotal(res.total)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load problems"
        if (!cancelled) {
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchProblems()

    return () => {
      cancelled = true
    }
  }, [limit, offset, device_type_id])

  return { data, total, loading, error }
}

/**
 * Fetch single problem by ID
 */
export function useProblem(id: number | null) {
  const [data, setData] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function fetchProblem() {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get<Problem>(API_ENDPOINTS.PROBLEMS.DETAIL(id as number))
        if (!cancelled) {
          setData(res)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load problem"
        if (!cancelled) {
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchProblem()

    return () => {
      cancelled = true
    }
  }, [id])

  return { data, loading, error }
}

/**
 * Create new problem
 */
export function useCreateProblem() {
  return useApiMutation<CreateProblemPayload, Problem>(
    API_ENDPOINTS.PROBLEMS.CREATE
  )
}

/**
 * Update problem
 */
export function useUpdateProblem() {
  return useApiUpdate<UpdateProblemPayload, Problem>(API_ENDPOINTS.PROBLEMS.LIST)
}

/**
 * Delete problem
 */
export function useDeleteProblem() {
  return useApiDelete(API_ENDPOINTS.PROBLEMS.LIST)
}

/**
 * Mutations hook for create, update, delete operations
 */
export function useProblemMutations() {
  const { mutate: createProblem, loading: createLoading, error: createError } = useCreateProblem()
  const { update: updateProblem, loading: updateLoading, error: updateError } = useUpdateProblem()
  const { deleteItem: deleteProblem, loading: deleteLoading, error: deleteError } = useDeleteProblem()

  return {
    createProblem: async (payload: CreateProblemPayload) => {
      return await createProblem(payload)
    },
    updateProblem: async (id: number, payload: UpdateProblemPayload) => {
      return await updateProblem(id, payload)
    },
    deleteProblem: async (id: number) => {
      return await deleteProblem(id)
    },
    loading: createLoading || updateLoading || deleteLoading,
    error: createError || updateError || deleteError,
  }
}

/**
 * Helper function to create a problem (for use in forms)
 */
export async function createProblem(payload: CreateProblemPayload): Promise<Problem> {
  return await api.post<Problem>(API_ENDPOINTS.PROBLEMS.CREATE, payload)
}

/**
 * Helper function to update a problem (for use in forms)
 */
export async function updateProblem(id: number, payload: UpdateProblemPayload): Promise<Problem> {
  return await api.patch<Problem>(API_ENDPOINTS.PROBLEMS.UPDATE(id), payload)
}

/**
 * Helper function to delete a problem (for use in forms)
 */
export async function deleteProblem(id: number): Promise<void> {
  return await api.delete(API_ENDPOINTS.PROBLEMS.DELETE(id))
}
