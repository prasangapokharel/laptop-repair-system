"use client"
import { TechnicianSidebar } from "@/components/sidebar/technician"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDeviceBrands } from "@/hooks/useDeviceBrands"
import { useDeviceTypes } from "@/hooks/useDeviceTypes"
import { useState } from "react"
import { apiJson } from "@/lib/api"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function CreateModelPage() {
  const router = useRouter()
  const { data: brands = [] } = useDeviceBrands()
  const { data: types = [] } = useDeviceTypes()
  const [name, setName] = useState("")
  const [brandId, setBrandId] = useState("")
  const [deviceTypeId, setDeviceTypeId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Model name is required")
      return
    }
    if (!brandId) {
      setError("Brand is required")
      return
    }
    if (!deviceTypeId) {
      setError("Device type is required")
      return
    }

    setLoading(true)
    try {
      await apiJson("/devices/models", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          brand_id: parseInt(brandId),
          device_type_id: parseInt(deviceTypeId),
        }),
      })
      router.push("/technician/devices/models")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create model")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <TechnicianSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Create Device Model</h1>
              <p className="text-muted-foreground">Add a new device model to the system</p>
            </div>
          </div>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Model Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Model Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., MacBook Pro, ThinkPad X1 Carbon, XPS 15"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Select value={brandId} onValueChange={setBrandId} disabled={loading} required>
                    <SelectTrigger id="brand">
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={String(brand.id)}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {brands.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No brands available. Please create a brand first.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deviceType">Device Type *</Label>
                  <Select value={deviceTypeId} onValueChange={setDeviceTypeId} disabled={loading} required>
                    <SelectTrigger id="deviceType">
                      <SelectValue placeholder="Select a device type" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type.id} value={String(type.id)}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {types.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No device types available. Please create a device type first.
                    </p>
                  )}
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading || brands.length === 0 || types.length === 0}>
                    {loading ? "Creating..." : "Create Model"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
