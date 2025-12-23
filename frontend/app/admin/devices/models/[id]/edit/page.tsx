"use client";
import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { updateDeviceModel, useDeviceModels } from "@/hooks/useDeviceModels"
import { useDeviceBrands } from "@/hooks/useDeviceBrands"
import { useDeviceTypes } from "@/hooks/useDeviceTypes"

export default function AdminEditModelPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const { data: models } = useDeviceModels()
  const { data: brands } = useDeviceBrands()
  const { data: types } = useDeviceTypes()
  const current = models.find((m) => m.id === id)
  const [name, setName] = useState(current?.name ?? "")
  const [brandId, setBrandId] = useState<number | null>(current?.brand_id ?? null)
  const [typeId, setTypeId] = useState<number | null>(current?.device_type_id ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (current) {
      setName((prev) => (prev ? prev : current.name))
      setBrandId((prev) => (prev ? prev : current.brand_id))
      setTypeId((prev) => (prev ? prev : current.device_type_id))
    }
  }, [current])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!brandId || !typeId) return
    setLoading(true)
    setError(null)
    try {
      await updateDeviceModel(id, {
        name,
        brand_id: brandId,
        device_type_id: typeId,
      })
      router.push("/admin/devices/models")
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to update model"
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
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold mb-4">Edit Model #{id}</h2>
          <Card>
            <CardContent className="p-6">
              <form onSubmit={onSubmit} className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Model Name</FieldLabel>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Brand</FieldLabel>
                    <Select value={brandId ? String(brandId) : undefined} onValueChange={(v) => setBrandId(Number(v))}>
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
                  </Field>
                  <Field>
                    <FieldLabel>Device Type</FieldLabel>
                    <Select value={typeId ? String(typeId) : undefined} onValueChange={(v) => setTypeId(Number(v))}>
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
                  </Field>
                  {error && (
                    <p className="text-sm text-red-500" role="alert">
                      {error}
                    </p>
                  )}
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
