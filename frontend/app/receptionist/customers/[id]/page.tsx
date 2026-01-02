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
import { useOrders } from "@/hooks/useOrders"
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
    filters: { customer_id: id },
  })

  const columns = [
    {
      key: "id",
      label: "Order ID",
      render: (id: number) => <span className="font-semibold text-sm">#{id}</span>,
    },
    {
      key: "problem",
      label: "Problem",
      render: (problem: any) => <span className="text-sm">{problem?.name || "N/A"}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (status: string) => {
        const variants: Record<string, string> = {
          Pending: "secondary",
          "In Progress": "default",
          Completed: "default",
          Cancelled: "destructive",
        }
        return (
          <Badge variant={variants[status] || "outline"}>
            {status}
          </Badge>
        )
      },
    },
    {
      key: "cost",
      label: "Cost",
      render: (cost: number) => <span className="font-mono text-sm">रु {cost}</span>,
    },
    {
      key: "total_cost",
      label: "Total",
      render: (total: number) => <span className="font-mono font-semibold text-sm">रु {total}</span>,
    },
    {
      key: "created_at",
      label: "Date",
      render: (date: string) => (
        <span className="text-sm text-muted-foreground">{new Date(date).toLocaleDateString()}</span>
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
                  <TableList
                    title="Customer Orders"
                    description={`All service orders for ${customer.full_name}`}
                    data={orders}
                    columns={columns}
                    isLoading={ordersLoading}
                    error={ordersError}
                    totalCount={ordersTotal}
                    currentPage={page}
                    pageSize={limit}
                    onPageChange={setPage}
                    actions={[
                      {
                        label: "View",
                        icon: <Eye className="h-4 w-4" />,
                        href: (id) => `/receptionist/orders/${id}`,
                      },
                      {
                        label: "Edit",
                        icon: <Edit className="h-4 w-4" />,
                        href: (id) => `/receptionist/orders/${id}/edit`,
                      },
                    ]}
                    emptyMessage="No orders found for this customer"
                    showSearch={false}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
