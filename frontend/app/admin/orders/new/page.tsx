"use client";
import { ReceptionistSidebar } from "@/components/sidebar/receptionist"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDeviceList } from "@/hooks/useDeviceList"
import { useOrderMutations } from "@/hooks/useOrderMutations"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ReceptionistNewOrderPage() {
  const { data: devices } = useDeviceList(100, 0)
  const { createOrder, loading, error } = useOrderMutations()
  const router = useRouter()
  const [deviceId, setDeviceId] = useState<number | null>(null)
  const [customerId, setCustomerId] = useState<number | null>(null)
  const [cost, setCost] = useState<string>("0.00")
  const [discount, setDiscount] = useState<string>("0.00")
  const [note, setNote] = useState<string>("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!deviceId) return
    try {
      await createOrder({
        device_id: deviceId,
        customer_id: customerId ?? null,
        cost,
        discount,
        note,
        status: "Pending",
      })
      router.push("/receptionist/orders")
    } catch {}
  }

  return (
    <SidebarProvider>
      <ReceptionistSidebar />
      <SidebarInset>
        <SiteHeader title="Create Order" />
        <div className="px-6 py-4">
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
                            #{d.id} • SN {d.serial_number ?? "N/A"} • Type {d.device_type_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Customer ID</FieldLabel>
                    <Input
                      type="number"
                      placeholder="e.g., 2"
                      value={customerId ?? ""}
                      onChange={(e) =>
                        setCustomerId(e.target.value ? Number(e.target.value) : null)
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
