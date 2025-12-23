"use client";
import { AccountantSidebar } from "@/components/sidebar/accountant"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePayments } from "@/hooks/usePayments"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { usePaymentMutations } from "@/hooks/usePaymentMutations"
import { useRouter } from "next/navigation"

export default function AccountantPaymentsPage() {
  const [status, setStatus] = useState<string | undefined>(undefined)
  const [orderIdFilter, setOrderIdFilter] = useState<number | undefined>(undefined)
  const { data, loading, error } = usePayments({
    status,
    order_id: orderIdFilter,
  })
  const { deletePayment } = usePaymentMutations()
  const router = useRouter()

  return (
    <SidebarProvider>
      <AccountantSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Payments</h2>
            <Button asChild>
              <Link href="/accountant/payments/add">Add Payment</Link>
            </Button>
          </div>
          <Separator className="my-4" />
          <div className="flex gap-3 items-end">
            <div className="w-48">
              <label className="text-sm">Status</label>
              <Select onValueChange={(v) => setStatus(v === "all" ? undefined : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <label className="text-sm">Order ID</label>
              <Input
                type="number"
                value={orderIdFilter ?? ""}
                onChange={(e) =>
                  setOrderIdFilter(e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="e.g., 104"
              />
            </div>
          </div>
          <Separator className="my-4" />
          {loading && <p>Loading payments...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.map((p) => (
                <div key={p.id} className="rounded-lg border p-4 bg-card shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Payment #{p.id} • Order #{p.order_id}
                    </span>
                    <span className="text-xs">{p.status}</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <p>Due: रु {p.due_amount}</p>
                    <p>Amount: रु {p.amount}</p>
                    <p>Method: {p.payment_method ?? "N/A"}</p>
                    <p>Txn: {p.transaction_id ?? "N/A"}</p>
                    <p>Paid At: {p.paid_at ?? "N/A"}</p>
                  </div>
                  <div className="mt-3">
                    <Button variant="outline" asChild>
                      <Link href={`/accountant/payments/${p.id}`}>View</Link>
                    </Button>
                    <Button variant="outline" className="ml-2" asChild>
                      <Link href={`/accountant/payments/${p.id}/edit`}>Edit</Link>
                    </Button>
                    <Button
                      variant="destructive"
                      className="ml-2"
                      onClick={async () => {
                        await deletePayment(p.id)
                        router.refresh()
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              {data.length === 0 && <p>No payments found</p>}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
