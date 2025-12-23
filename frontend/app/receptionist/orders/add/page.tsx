"use client";
import { ReceptionistSidebar } from "@/components/sidebar/receptionist"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDeviceList } from "@/hooks/useDeviceList"
import { useOrderMutations } from "@/hooks/useOrderMutations"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useUsers } from "@/hooks/useUsers"
import { useDeviceBrands } from "@/hooks/useDeviceBrands"
import { useDeviceModels } from "@/hooks/useDeviceModels"
import { useDeviceTypes } from "@/hooks/useDeviceTypes"

export default function ReceptionistAddOrderPage() {
  const { data: devices } = useDeviceList(100, 0)
  const { createOrder, assignOrder, loading, error } = useOrderMutations()
  const { data: users } = useUsers(100, 0)
  const { data: brands } = useDeviceBrands()
  const { data: models } = useDeviceModels()
  const { data: types } = useDeviceTypes()
  const router = useRouter()
  const [deviceId, setDeviceId] = useState<number | null>(null)
  const [customerId, setCustomerId] = useState<number | null>(null)
  const [problemId, setProblemId] = useState<number | null>(null)
  const [cost, setCost] = useState<string>("0.00")
  const [discount, setDiscount] = useState<string>("0.00")
  const [note, setNote] = useState<string>("")
  const [assigneeId, setAssigneeId] = useState<number | null>(null)
  const [eta, setEta] = useState<string>("")

  const brandMap = Object.fromEntries(brands.map((b) => [b.id, b.name]))
  const modelMap = Object.fromEntries(models.map((m) => [m.id, m.name]))
  const typeMap = Object.fromEntries(types.map((t) => [t.id, t.name]))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!deviceId) return
    try {
      const created = await createOrder({
        device_id: deviceId,
        customer_id: customerId ?? null,
        problem_id: problemId ?? null,
        cost,
        discount,
        note,
        status: "Pending",
        estimated_completion_date: eta || null,
      })
      if (created?.id && assigneeId) {
        await assignOrder(created.id, assigneeId)
      }
      router.push("/receptionist/orders")
    } catch {}
  }

  return (
    <SidebarProvider>
      <ReceptionistSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold mb-4">Create Order</h2>
          <Card>
            <CardContent className="p-6">
              <form onSubmit={onSubmit} className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Device</FieldLabel>
                    <Select
                      onValueChange={(v) => setDeviceId(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select device" />
                      </SelectTrigger>
                      <SelectContent>
                        {devices.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {brandMap[d.brand_id] ?? `Brand ${d.brand_id}`}{" "}
                            {modelMap[d.model_id] ?? `Model ${d.model_id}`}{" "}
                            • {typeMap[d.device_type_id] ?? `Type ${d.device_type_id}`}{" "}
                            • SN {d.serial_number ?? "N/A"} • #{d.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Assign To</FieldLabel>
                    <Select onValueChange={(v) => setAssigneeId(Number(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Optional assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.full_name} • #{u.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Customer</FieldLabel>
                    <Select
                      onValueChange={(v) =>
                        setCustomerId(v === "none" ? null : Number(v))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.full_name} • {u.phone} • #{u.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Problem ID</FieldLabel>
                    <Input
                      type="number"
                      placeholder="Optional problem reference"
                      value={problemId ?? ""}
                      onChange={(e) =>
                        setProblemId(e.target.value ? Number(e.target.value) : null)
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Cost</FieldLabel>
                    <Input
                      type="text"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Discount</FieldLabel>
                    <Input
                      type="text"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Note</FieldLabel>
                    <Input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Optional"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Estimated Completion</FieldLabel>
                    <Input
                      type="datetime-local"
                      value={eta}
                      onChange={(e) => setEta(e.target.value)}
                      placeholder="Optional"
                    />
                  </Field>
                  {error && (
                    <p className="text-sm text-red-500" role="alert">
                      {error}
                    </p>
                  )}
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Order"}
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
