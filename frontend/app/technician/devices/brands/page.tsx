"use client"
import { TechnicianSidebar } from "@/components/sidebar/technician"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useDeviceBrands } from "@/hooks/useDeviceBrands"
import { useState } from "react"
import { apiJson } from "@/lib/api"

export default function TechnicianDeviceBrandsPage() {
  const { data: brands = [] } = useDeviceBrands()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    
    if (!name.trim()) {
      setError("Brand name is required")
      return
    }

    setLoading(true)
    try {
      await apiJson("/devices/brands", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
        }),
      })
      setSuccess("Brand created successfully")
      setName("")
      setShowForm(false)
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create brand")
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
              <h1 className="text-3xl font-bold">Device Brands</h1>
              <p className="text-muted-foreground">Manage device brands</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "Add Brand"}
            </Button>
          </div>

          {showForm && (
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleCreate} className="space-y-4 max-w-md">
                  <div>
                    <Label>Brand Name *</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Apple, Dell, HP, Lenovo"
                      disabled={loading}
                    />
                  </div>

                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  {success && <div className="text-green-600 text-sm">{success}</div>}

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Creating..." : "Create Brand"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => (
              <Card key={brand.id}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg">{brand.name}</h3>
                  <p className="text-xs text-gray-500 mt-2">ID: {brand.id}</p>
                </CardContent>
              </Card>
            ))}
            {brands.length === 0 && !showForm && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground col-span-full">
                  No brands yet. Create one to get started.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
