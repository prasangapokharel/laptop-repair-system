"use client"

import { ReceptionistSidebar } from "@/components/sidebar/receptionist"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useOrders } from "@/hooks/useOrders"
import { useUsers } from "@/hooks/useUsers"
import { useDeviceList } from "@/hooks/useDeviceList"
import Link from "next/link"
import { TrendingUp, Users, Package, Clock, AlertCircle, CheckCircle2, MoreHorizontal } from "lucide-react"

const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  trend,
  color = "text-blue-600"
}: { 
  icon: React.ReactNode
  title: string
  value: number | string
  trend?: { value: number; positive: boolean }
  color?: string
}) => (
  <Card className="overflow-hidden hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className={color}>{Icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend && (
        <p className={`text-xs mt-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
          {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% from last period
        </p>
      )}
    </CardContent>
  </Card>
)

export default function ReceptionistDashboardPage() {
  const { data: orders, loading: ordersLoading, total: ordersTotal } = useOrders({ limit: 10, offset: 0 })
  const { data: customers, loading: customersLoading, total: customersTotal } = useUsers(10, 0)
  const { data: devices, loading: devicesLoading, total: devicesTotal } = useDeviceList(10, 0)

  const pendingOrders = orders.filter((o) => o.status === "Pending").length
  const inProgressOrders = orders.filter((o) => o.status === "In Progress").length
  const completedOrders = orders.filter((o) => o.status === "Completed").length

  return (
    <SidebarProvider>
      <ReceptionistSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 space-y-6 p-4 md:p-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Receptionist Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's an overview of your operations</p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              icon={<TrendingUp className="h-4 w-4" />}
              title="Total Orders" 
              value={ordersTotal || 0}
              trend={{ value: 12, positive: true }}
              color="text-blue-600"
            />
            <StatCard 
              icon={<Clock className="h-4 w-4" />}
              title="Pending Orders" 
              value={pendingOrders || 0}
              color="text-yellow-600"
            />
            <StatCard 
              icon={<Users className="h-4 w-4" />}
              title="Total Customers" 
              value={customersTotal || 0}
              trend={{ value: 8, positive: true }}
              color="text-green-600"
            />
            <StatCard 
              icon={<Package className="h-4 w-4" />}
              title="Total Devices" 
              value={devicesTotal || 0}
              color="text-purple-600"
            />
          </div>

          {/* Order Status Overview */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingOrders}</div>
                <p className="text-xs text-yellow-600 mt-1">Awaiting assignment</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inProgressOrders}</div>
                <p className="text-xs text-blue-600 mt-1">Being worked on</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedOrders}</div>
                <p className="text-xs text-green-600 mt-1">Ready for delivery</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Orders */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-lg">Recent Orders</CardTitle>
                  <CardDescription>Last 10 orders in the system</CardDescription>
                </div>
                <Button size="sm" variant="ghost" asChild>
                  <Link href="/receptionist/orders">View All →</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {ordersLoading ? (
                  <p className="text-sm text-muted-foreground py-8">Loading...</p>
                ) : orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8">No orders found</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {orders.map((order) => (
                      <div key={order.order_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm">Order #{order.order_id}</p>
                          <p className="text-xs text-muted-foreground">{order.problem_name || "N/A"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            order.status === "Completed" ? "default" : 
                            order.status === "Pending" ? "secondary" : 
                            order.status === "In Progress" ? "outline" :
                            "destructive"
                          }>
                            {order.status}
                          </Badge>
                          <p className="text-sm font-medium whitespace-nowrap">रु {order.total_cost}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" size="sm" asChild>
                  <Link href="/receptionist/orders/add">+ Create Order</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                  <Link href="/receptionist/customers">View Customers</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                  <Link href="/receptionist/devices">Device Inventory</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                  <Link href="/receptionist/problem">Manage Problems</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                  <Link href="/receptionist/orders">All Orders</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Customers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg">Recent Customers</CardTitle>
                <CardDescription>Last 10 registered customers</CardDescription>
              </div>
              <Button size="sm" variant="ghost" asChild>
                <Link href="/receptionist/customers">View All →</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {customersLoading ? (
                <p className="text-sm text-muted-foreground py-8">Loading...</p>
              ) : customers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8">No customers found</p>
              ) : (
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
                  {customers.map((customer) => (
                    <div key={customer.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <Link href={`/receptionist/customers/${customer.id}`} className="block">
                        <p className="font-medium text-sm line-clamp-2">{customer.full_name}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">{customer.phone}</p>
                        <p className="text-xs text-muted-foreground truncate hover:text-clip mt-1">{customer.email}</p>
                        <Badge variant={customer.is_active ? "default" : "secondary"} className="mt-2 text-xs">
                          {customer.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
