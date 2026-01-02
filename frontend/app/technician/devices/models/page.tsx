"use client"
import { TechnicianSidebar } from "@/components/sidebar/technician"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDeviceModels } from "@/hooks/useDeviceModels"
import { useDeviceBrands } from "@/hooks/useDeviceBrands"
import { useDeviceTypes } from "@/hooks/useDeviceTypes"
import { useState } from "react"
import { apiJson } from "@/lib/api"
import { Trash2 } from "lucide-react"

export default function TechnicianDeviceModelsPage() {
  const { data: models = [] } = useDeviceModels()
  const { data: brands = [] } = useDeviceBrands()
  const { data: types = [] } = useDeviceTypes()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [brandId, setBrandId] = useState<string>("")
  const [deviceTypeId, setDeviceTypeId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleDelete(modelId: number) {
    if (!confirm("Are you sure you want to delete this model?")) return
    
    try {
      await apiJson(`/devices/models/${modelId}`, {
        method: "DELETE",
      })
      window.location.reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete model")
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    
    if (!name.trim() || !brandId || !deviceTypeId) {
      setError("Model name, brand, and device type are required")
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
      setSuccess("Model created successfully")
      setName("")
      setBrandId("")
      setDeviceTypeId("")
      setShowForm(false)
      setTimeout(() => window.location.reload(), 1000)
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Device Models</h1>
              <p className="text-muted-foreground">Manage device models</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "Add Model"}
            </Button>
          </div>

          {showForm && (
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleCreate} className="space-y-4 max-w-md">
                  <div>
                    <Label>Model Name *</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., MacBook Pro, ThinkPad X1"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label>Brand *</Label>
                    <Select value={brandId} onValueChange={setBrandId} disabled={loading}>
                      <SelectTrigger>
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

                  <div>
                    <Label>Device Type *</Label>
                    <Select value={deviceTypeId} onValueChange={setDeviceTypeId} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select device type" />
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

                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  {success && <div className="text-green-600 text-sm">{success}</div>}

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Creating..." : "Create Model"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

           <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
             {models.map((model) => (
               <Card key={model.id}>
                 <CardContent className="p-6">
                   <div className="flex justify-between items-start">
                     <div>
                       <h3 className="font-semibold text-lg">{model.name}</h3>
                       <p className="text-sm text-muted-foreground">
                         Brand: {brands.find((b) => b.id === model.brand_id)?.name || `#${model.brand_id}`}
                       </p>
                       <p className="text-sm text-muted-foreground">
                         Type: {types.find((t) => t.id === model.device_type_id)?.name || `#${model.device_type_id}`}
                       </p>
                       <p className="text-xs text-gray-500 mt-2">ID: {model.id}</p>
                     </div>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => handleDelete(model.id)}
                       className="text-red-600 hover:text-red-700 hover:bg-red-50"
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </div>
                 </CardContent>
               </Card>
             ))}
            {models.length === 0 && !showForm && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground col-span-full">
                  No models yet. Create one to get started.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
