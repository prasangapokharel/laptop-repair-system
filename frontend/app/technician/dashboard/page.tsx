"use client";
import { TechnicianSidebar } from "@/components/sidebar/technician"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useOrders } from "@/hooks/useOrders"
import { useDeviceList } from "@/hooks/useDeviceList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, Smartphone } from "lucide-react"

export default function TechnicianDashboardPage() {
  const { data: orders, loading: loadingOrders, error: errorOrders } = useOrders({ limit: 100 })
  const { data: devices, loading: loadingDevices, error: errorDevices } = useDeviceList(100)

  const completedOrders = orders.filter(o => o.status === "Completed").length
  const pendingOrders = orders.filter(o => o.status === "Pending").length
  const totalDevices = devices.length

  return (
    <SidebarProvider>
      <TechnicianSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completed Orders
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loadingOrders ? "..." : completedOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Orders
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loadingOrders ? "..." : pendingOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Devices
                </CardTitle>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loadingDevices ? "..." : totalDevices}</div>
              </CardContent>
            </Card>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
            </div>
            <Separator className="my-4" />
            {loadingOrders && <p>Loading orders...</p>}
            {errorOrders && <p className="text-red-500">{errorOrders}</p>}
            {!loadingOrders && !errorOrders && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {orders.slice(0, 6).map((order) => (
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
                      <p>Total: रु {order.total_cost}</p>
                      <p>Cost: रु {order.cost}</p>
                      <p>Discount: रु {order.discount}</p>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p>No orders</p>}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
