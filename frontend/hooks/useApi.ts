/**
 * Generic Data Fetching Hook
 * Provides loading, error, and data state management for API calls
 */

import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api-client"

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiOptions {
  skip?: boolean
  onSuccess?: (data: unknown) => void
  onError?: (error: string) => void
}

/**
 * Generic hook for fetching data from API endpoints
 * @param path - API endpoint path
 * @param options - Configuration options
 * @returns Object with data, loading, and error states
 */
export function useApi<T = unknown>(
  path: string,
  options?: UseApiOptions
): UseApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const fetchData = useCallback(async () => {
    setState({ data: null, loading: true, error: null })
    try {
      const result = await api.get<T>(path)
      setState({ data: result, loading: false, error: null })
      options?.onSuccess?.(result)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch data"
      setState({ data: null, loading: false, error: errorMessage })
      options?.onError?.(errorMessage)
    }
  }, [path, options])

  useEffect(() => {
    if (options?.skip) {
      return
    }
    fetchData()
  }, [path, options?.skip, fetchData])

  return {
    ...state,
    refetch: fetchData,
  }
}

/**
 * Hook for handling POST requests
 * @param path - API endpoint path
 * @returns Object with mutation function and loading/error states
 */
export function useApiMutation<TRequest = unknown, TResponse = unknown>(path: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(
    async (data: TRequest): Promise<TResponse | null> => {
      setLoading(true)
      setError(null)
      try {
        const result = await api.post<TResponse>(path, data)
        setLoading(false)
        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to submit data"
        setError(errorMessage)
        setLoading(false)
        throw new Error(errorMessage)
      }
    },
    [path]
  )

  return { mutate, loading, error }
}

/**
 * Hook for handling PATCH requests (updates)
 * @param basePath - Base API endpoint path (without ID)
 * @returns Object with update function and loading/error states
 */
export function useApiUpdate<TRequest = unknown, TResponse = unknown>(
  basePath: string
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = useCallback(
    async (id: string | number, data: TRequest): Promise<TResponse | null> => {
      setLoading(true)
      setError(null)
      try {
        const path = `${basePath}/${id}`
        const result = await api.patch<TResponse>(path, data)
        setLoading(false)
        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update data"
        setError(errorMessage)
        setLoading(false)
        throw new Error(errorMessage)
      }
    },
    [basePath]
  )

  return { update, loading, error }
}

/**
 * Hook for handling DELETE requests
 * @param basePath - Base API endpoint path (without ID)
 * @returns Object with delete function and loading/error states
 */
export function useApiDelete(basePath: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteItem = useCallback(
    async (id: string | number): Promise<void> => {
      setLoading(true)
      setError(null)
      try {
        const path = `${basePath}/${id}`
        await api.delete(path)
        setLoading(false)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete item"
        setError(errorMessage)
        setLoading(false)
        throw new Error(errorMessage)
      }
    },
    [basePath]
  )

  return { deleteItem, loading, error }
}

/**
 * Hook for file uploads
 * @returns Object with upload function and loading/error states
 */
export function useFileUpload() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(async (file: File): Promise<string | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.upload("/upload", file)
      setLoading(false)
      return result?.file_path || null
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload file"
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }, [])

  return { upload, loading, error }
}
