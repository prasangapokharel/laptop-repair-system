"use client"

import { ReceptionistSidebar } from "@/components/sidebar/receptionist"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useProblemMutations } from "@/hooks/useProblems"
import { useDeviceTypes } from "@/hooks/useDeviceTypes"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReceptionistAddProblemPage() {
  const { createProblem, loading, error } = useProblemMutations()
  const { data: deviceTypes } = useDeviceTypes()
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [deviceTypeId, setDeviceTypeId] = useState<number | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!deviceTypeId) return
    try {
      await createProblem({
        device_type_id: deviceTypeId,
        name,
        description,
      })
      router.push("/receptionist/problem")
    } catch {}
  }

  return (
    <SidebarProvider>
      <ReceptionistSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between space-y-2 py-4">
             <h2 className="text-3xl font-bold tracking-tight">Add Problem</h2>
          </div>
          <div className="w-full">
            <Card className="w-full">
              <CardContent className="p-6">
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Broken Screen"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Device Type</Label>
                      <Select onValueChange={(v) => setDeviceTypeId(Number(v))}>
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
                      <Input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional description"
                      />
                    </div>
                  </div>
                  {error && (
                    <p className="text-sm text-red-500" role="alert">
                      {error}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading || !deviceTypeId}>
                      {loading ? "Creating..." : "Create Problem"}
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
