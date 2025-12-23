import { useEffect, useState } from "react"
import { apiJson } from "@/lib/api"

type Device = {
  id: number
  brand_id: number
  model_id: number
  device_type_id: number
  serial_number: string | null
}

export function useDeviceList(limit = 50, offset = 0) {
  const [data, setData] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await apiJson<Device[]>(
          `/devices?limit=${limit}&offset=${offset}`
        )
        setData(res)
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to load devices"
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset])

  return { data, loading, error }
}
