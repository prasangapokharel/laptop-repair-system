"use client"

import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useProblem, useProblemMutations } from "@/hooks/useProblems"
import { useDeviceTypes } from "@/hooks/useDeviceTypes"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminEditProblemPage() {
  const params = useParams()
  const id = Number(params.id)
  const { data: problem, loading: loadingProblem } = useProblem(id)
  const { updateProblem, loading: loadingUpdate, error } = useProblemMutations()
  const { data: deviceTypes } = useDeviceTypes()
  const router = useRouter()
  
  const [name, setName] = useState<string | null>(null)
  const [description, setDescription] = useState<string | null>(null)
  const [deviceTypeId, setDeviceTypeId] = useState<number | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const finalDeviceTypeId = deviceTypeId ?? problem?.device_type_id ?? null
    if (!finalDeviceTypeId) return
    try {
      await updateProblem(id, {
        device_type_id: finalDeviceTypeId,
        name: name ?? problem?.name ?? "",
        description: description ?? problem?.description ?? "",
      })
      router.push("/admin/problem")
    } catch {}
  }

  if (loadingProblem) {
    return <div>Loading...</div>
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between space-y-2 py-4">
             <h2 className="text-3xl font-bold tracking-tight">Edit Problem</h2>
          </div>
          <div className="w-full">
            <Card className="w-full">
              <CardContent className="p-6">
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input type="text" value={name ?? problem?.name ?? ""} onChange={(e) => setName(e.target.value)} placeholder="Broken Screen" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Device Type</Label>
                      <Select value={(deviceTypeId ?? problem?.device_type_id ?? undefined) ? String(deviceTypeId ?? problem?.device_type_id) : undefined} onValueChange={(v) => setDeviceTypeId(Number(v))}>
                        <SelectTrigger>
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
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Description</Label>
                      <Input type="text" value={description ?? problem?.description ?? ""} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
                    </div>
                  </div>
                  {error && (
                    <p className="text-sm text-red-500" role="alert">
                      {error}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loadingUpdate || !deviceTypeId}>
                      {loadingUpdate ? "Saving..." : "Save Changes"}
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
