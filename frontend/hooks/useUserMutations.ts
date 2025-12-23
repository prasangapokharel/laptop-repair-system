import { useState } from "react"
import { apiJson } from "@/lib/api"
import type { User } from "./useUsers"

type CreateUserInput = {
  full_name: string
  phone: string
  email: string
  password: string
  is_staff?: boolean
  profile_picture?: string | null
}

type UpdateUserInput = Partial<Omit<CreateUserInput, "password">> & {
  is_active?: boolean
  profile_picture?: string | null
}

export function useUserMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function createUser(input: CreateUserInput) {
    setLoading(true)
    setError(null)
    try {
      const res = await apiJson<User>(`/users`, {
        method: "POST",
        body: JSON.stringify(input),
      })
      return res
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to create user"
      setError(message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  async function updateUser(id: number, input: UpdateUserInput) {
    setLoading(true)
    setError(null)
    try {
      const res = await apiJson<User>(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      })
      return res
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to update user"
      setError(message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  async function deleteUser(id: number) {
    setLoading(true)
    setError(null)
    try {
      await apiJson<void>(`/users/${id}`, {
        method: "DELETE",
      })
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to delete user"
      setError(message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  async function assignRole(user_id: number, role_id: number) {
    setLoading(true)
    setError(null)
    try {
      await apiJson<void>(`/users/roles/enroll`, {
        method: "POST",
        body: JSON.stringify({ user_id, role_id }),
      })
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to assign role"
      setError(message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  async function changePassword(id: number, newPassword: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await apiJson<User>(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ password: newPassword }),
      })
      return res
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to change password"
      setError(message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { createUser, updateUser, deleteUser, assignRole, changePassword, loading, error }
}
