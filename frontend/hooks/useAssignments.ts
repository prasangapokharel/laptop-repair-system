/**
 * Assignments Management Hook
 * Provides functionality for assigning orders to technicians
 */

"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/config/api.config"

export interface Assignment {
  id: number
  order_id: number
  technician_id: number
  assigned_at: string
  completed_at?: string
  status: "pending" | "in_progress" | "completed"
  notes?: string
}

interface AssignmentFilters {
  limit?: number
  offset?: number
  technician_id?: number
  status?: string
}

interface CreateAssignmentPayload {
  order_id: number
  technician_id: number
  notes?: string
}

/**
 * Fetch assignments with optional filters
 */
export function useAssignments(filters: AssignmentFilters = {}) {
  const { limit = 20, offset = 0, technician_id, status } = filters
  const [data, setData] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchAssignments() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set("limit", String(limit))
        params.set("offset", String(offset))
        if (technician_id) params.set("technician_id", String(technician_id))
        if (status) params.set("status", status)

        const path =
          params.toString()
            ? `${API_ENDPOINTS.ASSIGNMENTS.LIST}?${params.toString()}`
            : API_ENDPOINTS.ASSIGNMENTS.LIST

        const res = await api.get<Assignment[]>(path)
        if (!cancelled) {
          setData(res)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load assignments"
        if (!cancelled) {
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchAssignments()

    return () => {
      cancelled = true
    }
  }, [limit, offset, technician_id, status])

  return { data, loading, error }
}

/**
 * Get single assignment
 */
export function useAssignmentDetail(id: number) {
  const [data, setData] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchAssignment() {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get<Assignment>(
          API_ENDPOINTS.ASSIGNMENTS.DETAIL(id)
        )
        if (!cancelled) {
          setData(res)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load assignment"
        if (!cancelled) {
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (id) fetchAssignment()

    return () => {
      cancelled = true
    }
  }, [id])

  return { data, loading, error }
}

/**
 * Create and manage assignments
 */
export function useAssignmentMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createAssignment = async (payload: CreateAssignmentPayload) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post<Assignment>(
        API_ENDPOINTS.ASSIGNMENTS.CREATE,
        payload
      )
      return res
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create assignment"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateAssignment = async (
    id: number,
    payload: Partial<Assignment>
  ) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.patch<Assignment>(
        API_ENDPOINTS.ASSIGNMENTS.DETAIL(id),
        payload
      )
      return res
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update assignment"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteAssignment = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(API_ENDPOINTS.ASSIGNMENTS.DELETE(id))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete assignment"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createAssignment, updateAssignment, deleteAssignment, loading, error }
}
