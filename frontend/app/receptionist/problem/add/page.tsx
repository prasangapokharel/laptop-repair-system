"use client"

import { ReceptionistSidebar } from "@/components/sidebar/receptionist"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useProblemMutations } from "@/hooks/useProblems"
import { useDeviceTypes } from "@/hooks/useDeviceTypes"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Breadcrumb } from "@/components/breadcrumb"
import { Plus, AlertCircle } from "lucide-react"

export default function ReceptionistAddProblemPage() {
  const { createProblem, loading, error } = useProblemMutations()
  const { data: deviceTypes } = useDeviceTypes()
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [deviceTypeId, setDeviceTypeId] = useState<number | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!deviceTypeId || !name.trim()) return
    try {
      await createProblem({
        device_type_id: deviceTypeId,
        name,
        description,
      })
      router.push("/receptionist/problem")
    } catch (err) {
      console.error("Failed to create problem:", err)
    }
  }

  return (
    <SidebarProvider>
      <ReceptionistSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 space-y-4 p-4 md:p-6">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/receptionist/dashboard" },
              { label: "Problems", href: "/receptionist/problem" },
              { label: "Add Problem" },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Plus className="h-8 w-8" />
                Add New Problem
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Create a new device problem or issue category</p>
            </div>
            <Button variant="outline" asChild>
              <a href="/receptionist/problem">← Back</a>
            </Button>
          </div>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Problem Details</CardTitle>
              <CardDescription>Fill in the information for the new problem</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <form onSubmit={onSubmit} className="space-y-6">
                {/* Problem Name */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Problem Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base">Problem Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Broken Screen, Battery Dead, Overheating"
                      required
                      className="text-base"
                    />
                    <p className="text-xs text-muted-foreground">{name.length} characters</p>
                  </div>
                </div>

                {/* Device Type Selection */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Device Classification</h3>
                  <div className="space-y-2">
                    <Label htmlFor="device-type" className="text-base">Device Type *</Label>
                    <Select value={deviceTypeId ? String(deviceTypeId) : ""} onValueChange={(v) => setDeviceTypeId(Number(v))}>
                      <SelectTrigger id="device-type" className="text-base">
                        <SelectValue placeholder="Select device type" />
                      </SelectTrigger>
                      <SelectContent>
                        {deviceTypes.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">No device types available</div>
                        ) : (
                          deviceTypes.map((dt) => (
                            <SelectItem key={dt.id} value={String(dt.id)}>
                              {dt.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Select the device type this problem applies to</p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Additional Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base">Description (Optional)</Label>
                    <Input
                      id="description"
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a detailed description of this problem..."
                      className="text-base"
                    />
                    <p className="text-xs text-muted-foreground">{description.length} characters</p>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Form Validation */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className={name.trim() ? "text-green-600" : "text-muted-foreground"}>
                      {name.trim() ? "✓" : "○"} Problem name
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={deviceTypeId ? "text-green-600" : "text-muted-foreground"}>
                      {deviceTypeId ? "✓" : "○"} Device type
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" type="button" asChild>
                    <a href="/receptionist/problem">Cancel</a>
                  </Button>
                  <Button type="submit" disabled={loading || !name.trim() || !deviceTypeId}>
                    {loading ? "Creating..." : "Create Problem"}
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
