"use client"

import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createCostSetting } from "@/hooks/useCostSettings"
import { useDeviceTypes } from "@/hooks/useDeviceTypes"
import { useProblems } from "@/hooks/useProblems"
import { Breadcrumb } from "@/components/breadcrumb"

export default function AdminAddCostSettingPage() {
  const router = useRouter()
  const { data: deviceTypes } = useDeviceTypes()
  const { data: problems } = useProblems(100, 0)

  const [formData, setFormData] = useState({
    device_type_id: "",
    problem_id: "",
    cost: "",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.device_type_id || !formData.problem_id || !formData.cost) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError(null)
    try {
      await createCostSetting({
        device_type_id: Number(formData.device_type_id),
        problem_id: Number(formData.problem_id),
        cost: formData.cost,
        description: formData.description || undefined,
      })
      router.push("/admin/cost-settings")
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create cost setting"
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
        <div className="flex-1 space-y-4 p-4 md:p-6">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/admin/dashboard" },
              { label: "Cost Settings", href: "/admin/cost-settings" },
              { label: "Add" },
            ]}
          />

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add Cost Setting</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Create a new repair cost for a device type and problem combination
            </p>
          </div>

          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>New Cost Setting</CardTitle>
                <CardDescription>
                  Define the repair cost for a specific device type and problem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-6">
                  {/* Device Type Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Device Type *</label>
                    <Select
                      value={formData.device_type_id}
                      onValueChange={(value) => handleSelectChange("device_type_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a device type" />
                      </SelectTrigger>
                      <SelectContent>
                        {deviceTypes.map((type) => (
                          <SelectItem key={type.id} value={String(type.id)}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Problem Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Problem *</label>
                    <Select
                      value={formData.problem_id}
                      onValueChange={(value) => handleSelectChange("problem_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a problem" />
                      </SelectTrigger>
                      <SelectContent>
                        {problems.map((problem) => (
                          <SelectItem key={problem.id} value={String(problem.id)}>
                            {problem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cost */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cost (रु) *</label>
                    <Input
                      type="number"
                      name="cost"
                      value={formData.cost}
                      onChange={handleInputChange}
                      placeholder="Enter cost amount"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter description (optional)"
                      className="w-full px-3 py-2 border border-input rounded-md text-sm"
                      rows={3}
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 bg-red-50 p-3 rounded" role="alert">
                      {error}
                    </p>
                  )}

                  <div className="flex justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create Cost Setting"}
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
