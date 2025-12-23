"use client";
import { AccountantSidebar } from "@/components/sidebar/accountant"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useParams } from "next/navigation"
import { useState } from "react"
import { usePaymentDetail } from "@/hooks/usePaymentDetail"
import { usePaymentMutations } from "@/hooks/usePaymentMutations"

export default function AccountantEditPaymentPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const { data } = usePaymentDetail(id)
  const { updatePayment, loading, error } = usePaymentMutations()

  const [orderId, setOrderId] = useState<number | null>(null)
  const [dueAmount, setDueAmount] = useState<string | null>(null)
  const [amount, setAmount] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [method, setMethod] = useState<string | null>(null)
  const [txn, setTxn] = useState<string | null>(null)

  const orderIdVal = orderId ?? data?.order_id ?? null
  const dueAmountVal = dueAmount ?? data?.due_amount ?? "0.00"
  const amountVal = amount ?? data?.amount ?? "0.00"
  const statusVal = status ?? data?.status ?? "Pending"
  const methodVal = method ?? data?.payment_method ?? null
  const txnVal = txn ?? data?.transaction_id ?? null

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updatePayment(id, {
        order_id: orderIdVal ?? undefined,
        due_amount: dueAmountVal,
        amount: amountVal,
        status: statusVal,
        payment_method: methodVal ?? undefined,
        transaction_id: txnVal ?? undefined,
      })
      router.push(`/accountant/payments/${id}`)
    } catch {}
  }

  return (
    <SidebarProvider>
      <AccountantSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold mb-4">Edit Payment #{id}</h2>
          <Card>
            <CardContent className="p-6">
              <form onSubmit={onSubmit} className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Order ID</FieldLabel>
                    <Input
                      type="number"
                      value={orderIdVal ?? ""}
                      onChange={(e) =>
                        setOrderId(e.target.value ? Number(e.target.value) : null)
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Due Amount</FieldLabel>
                    <Input
                      type="text"
                      value={dueAmountVal}
                      onChange={(e) => setDueAmount(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Amount</FieldLabel>
                    <Input
                      type="text"
                      value={amountVal}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Status</FieldLabel>
                    <Select value={statusVal} onValueChange={(v) => setStatus(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Partial">Partial</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Payment Method</FieldLabel>
                    <Select value={methodVal ?? undefined} onValueChange={(v) => setMethod(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                        <SelectItem value="Transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Transaction ID</FieldLabel>
                    <Input
                      type="text"
                      value={txnVal ?? ""}
                      onChange={(e) => setTxn(e.target.value || null)}
                      placeholder="Optional"
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
