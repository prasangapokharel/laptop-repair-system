"use client";
import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useOrderDetail } from "@/hooks/useOrderDetail"
import { useOrderMutations } from "@/hooks/useOrderMutations"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

export default function AdminEditOrderPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const { data } = useOrderDetail(id)
  const { updateOrder, loading, error } = useOrderMutations()
  const router = useRouter()

  const [cost, setCost] = useState<string | null>(null)
  const [discount, setDiscount] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const costVal = cost ?? data?.cost ?? "0.00"
  const discountVal = discount ?? data?.discount ?? "0.00"
  const noteVal = note ?? data?.note ?? ""
  const statusVal = status ?? data?.status ?? "Pending"

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updateOrder(id, {
        cost: costVal,
        discount: discountVal,
        note: noteVal,
        status: statusVal,
      })
      router.push("/admin/orders")
    } catch {}
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold mb-4">Edit Order #{id}</h2>
          <Card>
            <CardContent className="p-6">
              <form onSubmit={onSubmit} className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Cost</FieldLabel>
                    <Input
                      type="text"
                      value={costVal}
                      onChange={(e) => setCost(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Discount</FieldLabel>
                    <Input
                      type="text"
                      value={discountVal}
                      onChange={(e) => setDiscount(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Note</FieldLabel>
                    <Input
                      type="text"
                      value={noteVal}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Status</FieldLabel>
                    <Input
                      type="text"
                      value={statusVal}
                      onChange={(e) => setStatus(e.target.value)}
                    />
                  </Field>
                  {error && (
                    <p className="text-sm text-red-500" role="alert">
                      {error}
                    </p>
                  )}
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
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
