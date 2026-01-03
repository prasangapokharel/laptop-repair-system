/**
 * User Mutations Hook
 * Provides functions for creating, updating, and deleting users
 */

"use client"
import { useState, useCallback } from "react"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/config/api.config"
import type { User } from "./useUsers"

interface CreateUserInput {
  full_name: string
  phone: string
  email: string
  password: string
  is_staff?: boolean
  profile_picture?: string | null
}

interface UpdateUserInput extends Partial<Omit<CreateUserInput, "password">> {
  is_active?: boolean
  profile_picture?: string | null
}

/**
 * Hook for user mutations (create, update, delete)
 */
export function useUserMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createUser = useCallback(async (input: CreateUserInput): Promise<User> => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post<User>(API_ENDPOINTS.USERS.CREATE, input)
      return res
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create user"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUser = useCallback(
    async (id: number, input: UpdateUserInput): Promise<User> => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.patch<User>(
          API_ENDPOINTS.USERS.UPDATE(id),
          input
        )
        return res
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update user"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const deleteUser = useCallback(async (id: number): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(API_ENDPOINTS.USERS.DELETE(id))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete user"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const assignRole = useCallback(
    async (user_id: number, role_id: number): Promise<void> => {
      setLoading(true)
      setError(null)
      try {
        await api.post(API_ENDPOINTS.USERS.ASSIGN_ROLE(user_id), {
          user_id,
          role_id,
        })
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to assign role"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const changePassword = useCallback(
    async (id: number, newPassword: string): Promise<User> => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.patch<User>(
          API_ENDPOINTS.USERS.UPDATE(id),
          { password: newPassword }
        )
        return res
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to change password"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    createUser,
    updateUser,
    deleteUser,
    assignRole,
    changePassword,
    loading,
    error,
  }
}
