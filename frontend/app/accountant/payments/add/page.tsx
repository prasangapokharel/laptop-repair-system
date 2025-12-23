"use client";
import { AccountantSidebar } from "@/components/sidebar/accountant"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { usePaymentMutations } from "@/hooks/usePaymentMutations"

export default function AccountantAddPaymentPage() {
  const router = useRouter()
  const { createPayment, loading, error } = usePaymentMutations()
  const [orderId, setOrderId] = useState<number | null>(null)
  const [dueAmount, setDueAmount] = useState("0.00")
  const [amount, setAmount] = useState("0.00")
  const [status, setStatus] = useState<string | null>("Paid")
  const [method, setMethod] = useState<string | null>("Cash")
  const [txn, setTxn] = useState<string | null>("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!orderId || !status) return
    try {
      await createPayment({
        order_id: orderId,
        due_amount: dueAmount,
        amount,
        status,
        payment_method: method,
        transaction_id: txn || undefined,
      })
      router.push("/accountant/payments")
    } catch {}
  }

  return (
    <SidebarProvider>
      <AccountantSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between space-y-2 py-4">
             <h2 className="text-3xl font-bold tracking-tight">Add Payment</h2>
          </div>
          <div className="w-full">
            <Card className="w-full">
              <CardContent className="p-6">
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <FieldLabel>Order ID</FieldLabel>
                      <Input
                        type="number"
                        value={orderId ?? ""}
                        onChange={(e) =>
                          setOrderId(e.target.value ? Number(e.target.value) : null)
                        }
                        placeholder="Order ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel>Due Amount</FieldLabel>
                      <Input
                        type="text"
                        value={dueAmount}
                        onChange={(e) => setDueAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel>Amount</FieldLabel>
                      <Input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                         placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <FieldLabel>Status</FieldLabel>
                      <Select onValueChange={(v) => setStatus(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Partial">Partial</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <FieldLabel>Payment Method</FieldLabel>
                      <Select onValueChange={(v) => setMethod(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Card">Card</SelectItem>
                          <SelectItem value="Transfer">Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <FieldLabel>Transaction ID</FieldLabel>
                      <Input
                        type="text"
                        value={txn ?? ""}
                        onChange={(e) => setTxn(e.target.value || null)}
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-red-500" role="alert">
                      {error}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create Payment"}
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
