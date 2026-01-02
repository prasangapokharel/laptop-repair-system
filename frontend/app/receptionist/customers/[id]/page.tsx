"use client"

import { ReceptionistSidebar } from "@/components/sidebar/receptionist"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useUserDetail } from "@/hooks/useUserDetail"
import { useOrders, type Order } from "@/hooks/useOrders"
import { useState } from "react"
import { TableList } from "@/components/tables/table-list"
import { Edit, Eye, Calendar, Mail, Phone } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"

export default function ReceptionistCustomerDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const { data: customer, loading: customerLoading, error: customerError } = useUserDetail(id)

  const [page, setPage] = useState(1)
  const limit = 10
  const offset = (page - 1) * limit

  const { data: orders, total: ordersTotal, loading: ordersLoading, error: ordersError } = useOrders({
    limit,
    offset,
    customer_id: id,
  })

  const columns = [
    {
      key: "order_id",
      header: "Order ID",
      render: (order: Order) => <span className="font-mono text-sm">#{order.order_id}</span>,
    },
    {
      key: "device_name",
      header: "Device",
      render: (order: Order) => <span className="text-sm">{order.device_name || "N/A"}</span>,
    },
    {
      key: "problem_name",
      header: "Problem",
      render: (order: Order) => <span className="text-sm">{order.problem_name || "N/A"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (order: Order) => {
        const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
          Pending: "secondary",
          "In Progress": "default",
          Completed: "default",
          Cancelled: "destructive",
        }
        return (
          <Badge variant={variants[order.status] || "outline"}>
            {order.status}
          </Badge>
        )
      },
    },
    {
      key: "cost",
      header: "Cost",
      render: (order: Order) => <span className="font-mono text-sm">रु {order.cost}</span>,
    },
    {
      key: "total_cost",
      header: "Total",
      render: (order: Order) => <span className="font-mono font-semibold text-sm">रु {order.total_cost}</span>,
    },
    {
      key: "created_at",
      header: "Date",
      render: (order: Order) => (
        <span className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</span>
      ),
    },
  ]

  return (
    <SidebarProvider>
      <ReceptionistSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 space-y-4 p-4 md:p-6">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/receptionist/dashboard" },
              { label: "Customers", href: "/receptionist/customers" },
              { label: "Customer Details" },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Customer Details</h1>
              <p className="text-muted-foreground text-sm mt-1">View customer information and order history</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/receptionist/customers">← Back</Link>
            </Button>
          </div>

          {customerLoading && <p className="text-muted-foreground">Loading customer information...</p>}
          {customerError && <p className="text-red-500">Error: {customerError}</p>}

          {!customerLoading && !customerError && customer && (
            <>
              {/* Customer Information Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{customer.full_name}</CardTitle>
                      <CardDescription>Customer ID: #{customer.id}</CardDescription>
                    </div>
                    <Badge variant={customer.is_active ? "default" : "secondary"}>
                      {customer.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-muted-foreground">CONTACT INFORMATION</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <p className="font-mono text-sm">{customer.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm">{customer.email || "Not provided"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Account Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-muted-foreground">ACCOUNT INFORMATION</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Member Since</p>
                            <p className="text-sm">{new Date(customer.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Role</p>
                          <Badge variant="outline">
                            {customer.role?.name || "Customer"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order History */}
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>
                    {ordersTotal} order{ordersTotal !== 1 ? "s" : ""} from this customer
                  </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  {ordersLoading && <p className="text-muted-foreground">Loading orders...</p>}
                  {ordersError && <p className="text-red-500">Error: {ordersError}</p>}
                  {!ordersLoading && !ordersError && (
                    <TableList
                      data={orders}
                      columns={columns}
                      loading={ordersLoading}
                      emptyMessage="No orders found for this customer"
                      searchableFields={["status"]}
                    />
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
