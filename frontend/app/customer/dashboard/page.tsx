"use client";
import { CustomerSidebar } from "@/components/sidebar/customer"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useOrders } from "@/hooks/useOrders"
import { useAuth } from "@/hooks/useAuth"

export default function CustomerDashboardPage() {
  const { user } = useAuth()
  const { data, loading, error } = useOrders({
    customer_id: user?.id ? Number(user.id) : undefined,
  })

  return (
    <SidebarProvider>
      <CustomerSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Recent Orders</h2>
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
              {data.length === 0 && <p>No orders</p>}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
