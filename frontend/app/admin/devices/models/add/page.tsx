"use client";
import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createDeviceModel } from "@/hooks/useDeviceModels"
import { useDeviceBrands } from "@/hooks/useDeviceBrands"
import { useDeviceTypes } from "@/hooks/useDeviceTypes"

export default function AdminAddModelPage() {
  const router = useRouter()
  const { data: brands = [] } = useDeviceBrands()
  const { data: types = [] } = useDeviceTypes()
  const [name, setName] = useState("")
  const [brandId, setBrandId] = useState<number | null>(null)
  const [typeId, setTypeId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!brandId || !typeId) return
    setLoading(true)
    setError(null)
    try {
      await createDeviceModel({
        name,
        brand_id: brandId,
        device_type_id: typeId,
      })
      router.push("/admin/devices/models")
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create model"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between space-y-2 py-4">
             <h2 className="text-3xl font-bold tracking-tight">Add Model</h2>
          </div>
          <div className="w-full">
            <Card className="w-full">
              <CardContent className="p-6">
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <FieldLabel>Model Name</FieldLabel>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Model Name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FieldLabel>Brand</FieldLabel>
                      <Select onValueChange={(v) => setBrandId(Number(v))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((b) => (
                            <SelectItem key={b.id} value={String(b.id)}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <FieldLabel>Device Type</FieldLabel>
                      <Select onValueChange={(v) => setTypeId(Number(v))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select device type" />
                        </SelectTrigger>
                        <SelectContent>
                          {types.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {error && (
                    <p className="text-sm text-red-500" role="alert">
                      {error}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create Model"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
