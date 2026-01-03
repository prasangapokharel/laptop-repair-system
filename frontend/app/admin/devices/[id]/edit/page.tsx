"use client"
import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Breadcrumb } from "@/components/breadcrumb"
import { IconDevices } from "@tabler/icons-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDeviceBrands } from "@/hooks/useDeviceBrands"
import { useDeviceModels } from "@/hooks/useDeviceModels"
import { useDeviceTypes } from "@/hooks/useDeviceTypes"
import { useUsers } from "@/hooks/useUsers"
import { apiJson } from "@/lib/api"
import { useParams } from "next/navigation"

interface Device {
  id: number
  brand_id: number
  model_id: number
  device_type_id: number
  serial_number: string | null
  owner_id?: number | null
  notes?: string | null
}

export default function AdminDeviceEditPage() {
  const router = useRouter()
  const params = useParams()
  const deviceId = params.id as string
  
  const { data: brands = [] } = useDeviceBrands()
  const { data: models = [] } = useDeviceModels()
  const { data: types = [] } = useDeviceTypes()
  const { data: users = [] } = useUsers(100, 0)
  
  const [brandId, setBrandId] = useState<number | null>(null)
  const [modelId, setModelId] = useState<number | null>(null)
  const [typeId, setTypeId] = useState<number | null>(null)
  const [serialNumber, setSerialNumber] = useState("")
  const [ownerId, setOwnerId] = useState<number | null>(null)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDevice() {
      try {
        const device = await apiJson<Device>(`/devices/${deviceId}`)
        setBrandId(device.brand_id)
        setModelId(device.model_id)
        setTypeId(device.device_type_id)
        setSerialNumber(device.serial_number || "")
        setOwnerId(device.owner_id || null)
        setNotes(device.notes || "")
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load device"
        setError(message)
      } finally {
        setFetchLoading(false)
      }
    }
    fetchDevice()
  }, [deviceId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    
    if (!brandId || !modelId || !typeId) {
      setError("Brand, Model, and Type are required")
      return
    }

    setLoading(true)
    try {
      await apiJson(`/devices/${deviceId}`, {
        method: "PATCH",
        body: JSON.stringify({
          brand_id: brandId,
          model_id: modelId,
          device_type_id: typeId,
          serial_number: serialNumber || null,
          owner_id: ownerId,
          notes: notes || null,
        }),
      })
      router.push("/admin/devices")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update device"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbItems = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Devices", href: "/admin/devices" },
    { label: "Edit Device", href: `/admin/devices/${deviceId}/edit` },
  ]

  if (fetchLoading) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">Loading device...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="flex items-center gap-2">
            <IconDevices className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Edit Device #{deviceId}</h1>
          </div>

          <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Select value={String(brandId)} onValueChange={(v) => setBrandId(Number(v))}>
                  <SelectTrigger id="brand">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={String(brand.id)}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Select value={String(modelId)} onValueChange={(v) => setModelId(Number(v))}>
                  <SelectTrigger id="model">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={String(model.id)}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Device Type *</Label>
                <Select value={String(typeId)} onValueChange={(v) => setTypeId(Number(v))}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial">Serial Number</Label>
                <Input
                  id="serial"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="SN123456"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">Owner (Optional)</Label>
              <Select value={ownerId ? String(ownerId) : undefined} onValueChange={(v) => setOwnerId(Number(v) || null)}>
                <SelectTrigger id="owner">
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.full_name} • {user.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about the device"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Device"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
