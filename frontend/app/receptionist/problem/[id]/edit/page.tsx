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
import { useProblem, useProblemMutations } from "@/hooks/useProblems"
import { useDeviceTypes } from "@/hooks/useDeviceTypes"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Breadcrumb } from "@/components/breadcrumb"
import { AlertCircle, Edit } from "lucide-react"

export default function ReceptionistEditProblemPage() {
  const params = useParams()
  const id = Number(params.id)
  const { data: problem, loading: loadingProblem } = useProblem(id)
  const { updateProblem, loading: loadingUpdate, error } = useProblemMutations()
  const { data: deviceTypes } = useDeviceTypes()
  const router = useRouter()
  
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [deviceTypeId, setDeviceTypeId] = useState<number | null>(null)

  // Initialize from problem data
  useEffect(() => {
    if (problem) {
      setName(problem.name || "")
      setDescription(problem.description || "")
      setDeviceTypeId(problem.device_type_id || null)
    }
  }, [problem])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const finalDeviceTypeId = deviceTypeId ?? problem?.device_type_id ?? null
    if (!finalDeviceTypeId || !name.trim()) return
    try {
      await updateProblem(id, {
        device_type_id: finalDeviceTypeId,
        name: name,
        description: description,
      })
      router.push("/receptionist/problem")
    } catch (err) {
      console.error("Failed to update problem:", err)
    }
  }

  if (loadingProblem) {
    return (
      <SidebarProvider>
        <ReceptionistSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="p-6">
            <p className="text-muted-foreground">Loading problem data...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!problem) {
    return (
      <SidebarProvider>
        <ReceptionistSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="p-6">
            <p className="text-red-500">Problem not found</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
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
              { label: `Problem #${id}` },
              { label: "Edit" },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Edit className="h-8 w-8" />
                Edit Problem
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Problem ID: #{id}</p>
            </div>
            <Button variant="outline" asChild>
              <a href="/receptionist/problem">← Back</a>
            </Button>
          </div>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Problem Details</CardTitle>
              <CardDescription>Update the problem information</CardDescription>
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
                      placeholder="e.g., Broken Screen, Battery Dead"
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
                        {deviceTypes.map((dt) => (
                          <SelectItem key={dt.id} value={String(dt.id)}>
                            {dt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Current type: <span className="font-semibold">{problem.device_type?.name || "Unknown"}</span></p>
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

                {/* Metadata */}
                <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Created:</span> <span>{new Date(problem.created_at || "").toLocaleString()}</span></p>
                  {problem.updated_at && (
                    <p><span className="text-muted-foreground">Last Updated:</span> <span>{new Date(problem.updated_at).toLocaleString()}</span></p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" type="button" asChild>
                    <a href="/receptionist/problem">Cancel</a>
                  </Button>
                  <Button type="submit" disabled={loadingUpdate || !name.trim() || !deviceTypeId}>
                    {loadingUpdate ? "Saving..." : "Save Changes"}
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
