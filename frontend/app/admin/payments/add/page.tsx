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
import { usePayments } from "@/hooks/usePayments"
import { useOrders } from "@/hooks/useOrders"
import { usePaymentMutations } from "@/hooks/usePaymentMutations"
import { Breadcrumb } from "@/components/breadcrumb"

export default function AdminAddPaymentPage() {
  const router = useRouter()
  const { data: orders } = useOrders({ limit: 100, offset: 0 })
  const { createPayment, loading, error } = usePaymentMutations()

  const [formData, setFormData] = useState({
    order_id: "",
    amount: "",
    due_amount: "",
    status: "Partial",
    payment_method: "",
    transaction_id: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.order_id || !formData.amount) {
      return
    }

    try {
      await createPayment({
        order_id: Number(formData.order_id),
        amount: formData.amount,
        due_amount: formData.due_amount || "0",
        status: formData.status,
        payment_method: formData.payment_method || null,
        transaction_id: formData.transaction_id || null,
      })
      router.push("/admin/payments")
    } catch (e) {
      console.error("Failed to record payment:", e)
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
              { label: "Payments", href: "/admin/payments" },
              { label: "Record Payment" },
            ]}
          />

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Record Payment</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Record a new payment for an order
            </p>
          </div>

          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>New Payment</CardTitle>
                <CardDescription>Record a new payment transaction</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-6">
                  {/* Order Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Order *</label>
                    <Select
                      value={formData.order_id}
                      onValueChange={(value) => handleSelectChange("order_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an order" />
                      </SelectTrigger>
                      <SelectContent>
                        {orders.map((order) => (
                          <SelectItem key={order.id} value={String(order.id)}>
                            Order #{order.id} - रु {order.total_cost}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                   {/* Amount */}
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Payment Amount (रु) *</label>
                     <Input
                       type="number"
                       name="amount"
                       value={formData.amount}
                       onChange={handleInputChange}
                       placeholder="Enter payment amount"
                       min="0"
                       step="0.01"
                     />
                   </div>

                   {/* Due Amount */}
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Due Amount (रु)</label>
                     <Input
                       type="number"
                       name="due_amount"
                       value={formData.due_amount}
                       onChange={handleInputChange}
                       placeholder="Enter remaining due amount"
                       min="0"
                       step="0.01"
                     />
                   </div>

                   {/* Status */}
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Payment Status</label>
                     <Select
                       value={formData.status}
                       onValueChange={(value) => handleSelectChange("status", value)}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select status" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="Pending">Pending</SelectItem>
                         <SelectItem value="Partial">Partial</SelectItem>
                         <SelectItem value="Paid">Paid</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>

                   {/* Payment Method */}
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Payment Method</label>
                     <Select
                       value={formData.payment_method}
                       onValueChange={(value) => handleSelectChange("payment_method", value)}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select payment method" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="Cash">Cash</SelectItem>
                         <SelectItem value="Card">Card</SelectItem>
                         <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                         <SelectItem value="Online">Online Payment</SelectItem>
                         <SelectItem value="Check">Check</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>

                  {/* Transaction ID */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Transaction ID</label>
                    <Input
                      type="text"
                      name="transaction_id"
                      value={formData.transaction_id}
                      onChange={handleInputChange}
                      placeholder="Enter transaction ID (optional)"
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
                      {loading ? "Recording..." : "Record Payment"}
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
