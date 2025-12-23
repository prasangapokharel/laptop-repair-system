"use client";

import { AccountantSidebar } from "@/components/sidebar/accountant"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { usePayments } from "@/hooks/usePayments"

export default function AccountantDashboardPage() {
  const { data, loading, error } = usePayments()

  return (
    <SidebarProvider>
      <AccountantSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Payments</h2>
          </div>
          <Separator className="my-4" />
          {loading && <p>Loading payments...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border p-4 bg-card shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Payment #{p.id}
                    </span>
                    <span className="text-xs">{p.status}</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <p>Order: {p.order_id}</p>
                    <p>Amount: रु {p.amount}</p>
                    <p>Due: रु {p.due_amount}</p>
                    <p>Method: {p.payment_method || "N/A"}</p>
                  </div>
                </div>
              ))}
              {data.length === 0 && <p>No payments</p>}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
