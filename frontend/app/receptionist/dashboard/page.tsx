"use client";
import { ReceptionistSidebar } from "@/components/sidebar/receptionist"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useOrders } from "@/hooks/useOrders"

export default function ReceptionistDashboardPage() {
  const { data, loading, error } = useOrders({ status: "Pending" })

  return (
    <SidebarProvider>
      <ReceptionistSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Pending Orders</h2>
          </div>
          <Separator className="my-4" />
          {loading && <p>Loading orders...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.slice(0, 6).map((order) => (
                <div
                  key={order.id}
                  className="rounded-lg border p-4 bg-card shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Order #{order.id}
                    </span>
                    <span className="text-xs">{order.status}</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <p>Total: {order.total_cost}</p>
                    <p>Cost: {order.cost}</p>
                    <p>Discount: {order.discount}</p>
                  </div>
                </div>
              ))}
              {data.length === 0 && <p>No pending orders</p>}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
