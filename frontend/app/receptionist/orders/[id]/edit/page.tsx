"use client";
import { ReceptionistSidebar } from "@/components/sidebar/receptionist"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useOrderDetail } from "@/hooks/useOrderDetail"
import { useOrderMutations } from "@/hooks/useOrderMutations"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Breadcrumb } from "@/components/breadcrumb"

export default function ReceptionistEditOrderPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const { data } = useOrderDetail(id)
  const { updateOrder, loading, error } = useOrderMutations()
  const router = useRouter()

  const [cost, setCost] = useState<string>("")
  const [discount, setDiscount] = useState<string>("")
  const [note, setNote] = useState<string>("")
  const [status, setStatus] = useState<string>("")

  // Initialize values from data
  useEffect(() => {
    if (data) {
      setCost(data.cost?.toString() || "0.00")
      setDiscount(data.discount?.toString() || "0.00")
      setNote(data.note || "")
      setStatus(data.status || "Pending")
    }
  }, [data])

  const statuses = ["Pending", "In Progress", "Completed", "Cancelled"]

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updateOrder(id, {
        cost: cost || "0.00",
        discount: discount || "0.00",
        note: note,
        status: status || "Pending",
      })
      router.push(`/receptionist/orders/${id}`)
    } catch (err) {
      console.error("Failed to update order:", err)
    }
  }

  if (!data) {
    return (
      <SidebarProvider>
        <ReceptionistSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="p-6">
            <p className="text-muted-foreground">Loading order data...</p>
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
              { label: "Orders", href: "/receptionist/orders" },
              { label: `Order #${id}` },
              { label: "Edit" },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Order</h1>
              <p className="text-muted-foreground text-sm mt-1">Order ID: #{id}</p>
            </div>
            <Button variant="outline" asChild>
              <a href="/receptionist/orders">← Back</a>
            </Button>
          </div>

          {/* Order Edit Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
              <CardDescription>Update order details and status</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <form onSubmit={onSubmit} className="space-y-6">
                {/* Status Section */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Status Management</h3>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-base">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Current status: <span className="font-semibold">{data.status}</span>
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Pricing Section */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Pricing Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cost" className="text-base">Base Cost (रु)</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        placeholder="0.00"
                      />
                      <p className="text-xs text-muted-foreground">Original cost: रु {data.cost}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount" className="text-base">Discount (रु)</Label>
                      <Input
                        id="discount"
                        type="number"
                        step="0.01"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        placeholder="0.00"
                      />
                      <p className="text-xs text-muted-foreground">Original discount: रु {data.discount || 0}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
                    <p className="text-2xl font-bold font-mono">
                      रु {(parseFloat(cost || "0") - parseFloat(discount || "0")).toFixed(2)}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Notes Section */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Additional Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="note" className="text-base">Internal Note</Label>
                    <Input
                      id="note"
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add any internal notes about this order"
                    />
                    <p className="text-xs text-muted-foreground">
                      {note.length} characters
                    </p>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                )}

                {/* Order Metadata */}
                <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Device ID:</span> <span className="font-mono">#{data.device_id}</span></p>
                  <p><span className="text-muted-foreground">Customer ID:</span> <span className="font-mono">#{data.customer_id || "N/A"}</span></p>
                  <p><span className="text-muted-foreground">Created:</span> <span>{new Date(data.created_at).toLocaleString()}</span></p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" type="button" asChild>
                    <a href="/receptionist/orders">Cancel</a>
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
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
