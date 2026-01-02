"use client"
import { TechnicianSidebar } from "@/components/sidebar/technician"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useDeviceTypes } from "@/hooks/useDeviceTypes"
import { useState } from "react"
import { apiJson } from "@/lib/api"

export default function TechnicianDeviceTypesPage() {
  const { data: types = [] } = useDeviceTypes()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    
    if (!name.trim()) {
      setError("Device type name is required")
      return
    }

    setLoading(true)
    try {
      await apiJson("/devices/types", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      })
      setSuccess("Device type created successfully")
      setName("")
      setDescription("")
      setShowForm(false)
      // Refresh page
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create device type")
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
              <h1 className="text-3xl font-bold">Device Types</h1>
              <p className="text-muted-foreground">Manage device types for service</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "Add Device Type"}
            </Button>
          </div>

          {showForm && (
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleCreate} className="space-y-4 max-w-md">
                  <div>
                    <Label>Device Type Name *</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Laptop, Desktop, Tablet"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional description"
                      disabled={loading}
                    />
                  </div>

                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  {success && <div className="text-green-600 text-sm">{success}</div>}

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Creating..." : "Create Device Type"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {types.map((type) => (
              <Card key={type.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{type.name}</h3>
                      {type.description && (
                        <p className="text-muted-foreground text-sm">{type.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">ID: {type.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {types.length === 0 && !showForm && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No device types yet. Create one to get started.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
