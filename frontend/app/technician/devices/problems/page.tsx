"use client"
import { TechnicianSidebar } from "@/components/sidebar/technician"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProblems } from "@/hooks/useProblems"
import { useDeviceTypes } from "@/hooks/useDeviceTypes"
import { useState } from "react"
import { apiJson } from "@/lib/api"

export default function TechnicianProblemsPage() {
  const { data: problems = [] } = useProblems()
  const { data: types = [] } = useDeviceTypes()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [deviceTypeId, setDeviceTypeId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    
    if (!name.trim() || !deviceTypeId) {
      setError("Problem name and device type are required")
      return
    }

    setLoading(true)
    try {
      await apiJson("/problems", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          device_type_id: parseInt(deviceTypeId),
        }),
      })
      setSuccess("Problem created successfully")
      setName("")
      setDescription("")
      setDeviceTypeId("")
      setShowForm(false)
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create problem")
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
              <h1 className="text-3xl font-bold">Device Problems</h1>
              <p className="text-muted-foreground">Manage device problems for troubleshooting</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "Add Problem"}
            </Button>
          </div>

          {showForm && (
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleCreate} className="space-y-4 max-w-md">
                  <div>
                    <Label>Problem Name *</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Screen Broken, Battery Not Charging"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of the problem"
                      disabled={loading}
                    />
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
                    {loading ? "Creating..." : "Create Problem"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {problems.map((problem) => (
              <Card key={problem.id}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg">{problem.name}</h3>
                  {problem.description && (
                    <p className="text-sm text-muted-foreground mt-2">{problem.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">ID: {problem.id}</p>
                </CardContent>
              </Card>
            ))}
            {problems.length === 0 && !showForm && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground col-span-full">
                  No problems yet. Create one to get started.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
