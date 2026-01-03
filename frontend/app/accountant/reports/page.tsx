"use client";
import { AccountantSidebar } from "@/components/sidebar/accountant"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb } from "@/components/breadcrumb"
import { IconReport, IconCash, IconClipboardList, IconTrendingUp, IconCalendar } from "@tabler/icons-react"
import { useOrders } from "@/hooks/useOrders"
import { usePayments } from "@/hooks/usePayments"

export default function AccountantReportsPage() {
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const { data: orders = [] } = useOrders({ limit: 1000, offset: 0 })
  const { data: payments = [] } = usePayments(1000, 0)

  // Calculate statistics
  const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0)
  const totalOrders = orders.length
  const completedOrders = orders.filter(o => o.status === "Completed").length
  const pendingPayments = orders.length - payments.length

  const stats = [
    {
      title: "Total Revenue",
      value: `रु ${totalRevenue.toFixed(2)}`,
      description: "All time revenue",
      icon: IconCash,
      color: "text-green-600",
    },
    {
      title: "Total Orders",
      value: totalOrders,
      description: "All orders in system",
      icon: IconClipboardList,
      color: "text-blue-600",
    },
    {
      title: "Completed Orders",
      value: completedOrders,
      description: `${totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0}% completion rate`,
      icon: IconTrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Pending Payments",
      value: pendingPayments,
      description: "Orders without payment",
      icon: IconCalendar,
      color: "text-orange-600",
    },
  ]

  const breadcrumbItems = [
    { label: "Dashboard", href: "/accountant/dashboard" },
    { label: "Reports", href: "/accountant/reports" },
  ]

  return (
    <SidebarProvider>
      <AccountantSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconReport className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Financial Reports</h1>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue by Status */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Order Status</CardTitle>
              <CardDescription>Breakdown of payments by order status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Pending", "In Progress", "Completed", "Cancelled"].map((status) => {
                  const statusOrders = orders.filter(o => o.status === status)
                  const statusRevenue = statusOrders.reduce(
                    (sum, o) => sum + parseFloat(o.total_cost || "0"),
                    0
                  )
                  const percentage = totalRevenue > 0 ? (statusRevenue / totalRevenue) * 100 : 0

                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{status}</span>
                        <span className="text-muted-foreground">
                          रु {statusRevenue.toFixed(2)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Last 10 payments received</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.slice(0, 10).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-sm">Payment #{payment.id}</p>
                      <p className="text-xs text-muted-foreground">
                        Order #{payment.order_id} • {payment.payment_method}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">रु {payment.amount}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {payments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No payments found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
