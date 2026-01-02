/**
 * Device Detail Hook
 * Fetches a single device by ID
 */

"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/config/api.config"
import type { Device } from "./useDeviceList"

/**
 * Fetch single device by ID
 */
export function useDeviceDetail(id: number) {
  const [data, setData] = useState<Device | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function fetchDevice() {
      setLoading(true)
      setError(null)
      try {
        const device = await api.get<Device>(API_ENDPOINTS.DEVICES.DETAIL(id))
        if (!cancelled) {
          setData(device)
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
