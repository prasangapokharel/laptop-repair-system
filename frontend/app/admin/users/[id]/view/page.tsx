"use client";
import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useUserDetail } from "@/hooks/useUsers"
import { useOrders } from "@/hooks/useOrders"
import { useParams, useRouter } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"
import { User, Mail, Phone, Calendar, Shield, ClipboardList, Eye } from "lucide-react"
import { TableList, type ColumnDef } from "@/components/tables/table-list"

interface OrderDisplay {
  order_id: number
  device_name: string | null
  problem_name: string | null
  status: string
  cost: string
  total_cost: string
  created_at: string
}

export default function AdminUserViewPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const userId = Number(params.id)
  const { data: user, loading: userLoading, error: userError } = useUserDetail(userId)
  
  // Fetch orders for this user if they are a customer
  const isCustomer = user?.role?.name === "Customer"
  const { data: orders, loading: ordersLoading } = useOrders({
    customer_id: isCustomer ? userId : undefined,
    limit: 100,
    offset: 0,
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "Pending": "secondary",
      "In Progress": "default",
      "Completed": "default",
      "Cancelled": "destructive",
    }
    return variants[status] || "outline"
  }

  const orderColumns: ColumnDef<OrderDisplay>[] = [
    {
      key: "order_id",
      header: "Order ID",
      render: (order) => <span className="font-semibold text-sm">#{order.order_id}</span>,
      sortable: true,
      width: "80px",
    },
    {
      key: "device_name",
      header: "Device",
      render: (order) => <span className="text-sm">{order.device_name || "N/A"}</span>,
      sortable: true,
    },
    {
      key: "problem_name",
      header: "Problem",
      render: (order) => <span className="text-sm">{order.problem_name || "N/A"}</span>,
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (order) => (
        <Badge variant={getStatusVariant(order.status)} className="text-xs">
          {order.status}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "cost",
      header: "Cost",
      render: (order) => <span className="font-mono text-sm">रु {order.cost}</span>,
      sortable: true,
    },
    {
      key: "total_cost",
      header: "Total",
      render: (order) => (
        <span className="font-mono font-semibold text-sm">रु {order.total_cost}</span>
      ),
      sortable: true,
    },
    {
      key: "created_at",
      header: "Created",
      render: (order) => (
        <span className="text-sm text-muted-foreground">
          {new Date(order.created_at).toLocaleDateString()}
        </span>
      ),
      sortable: true,
    },
  ]

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 space-y-4 p-4 md:p-6">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/admin/dashboard" },
              { label: "Users", href: "/admin/users" },
              { label: `User #${userId}` },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
              <p className="text-muted-foreground text-sm mt-1">User ID: #{userId}</p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href={`/admin/users/${userId}/edit`}>Edit User</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/users">← Back</Link>
              </Button>
            </div>
          </div>

          {userLoading && <p className="text-muted-foreground">Loading user details...</p>}
          {userError && <p className="text-red-500">Error: {userError}</p>}

          {!userLoading && !userError && user && (
            <div className="grid gap-6">
              {/* User Profile Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user.profile_picture || undefined} alt={user.full_name} />
                      <AvatarFallback className="text-2xl">
                        {user.full_name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-2xl">{user.full_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Shield className="h-4 w-4" />
                        {user.role?.name || "No Role Assigned"}
                      </CardDescription>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={user.is_active ? "default" : "destructive"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {user.is_staff && (
                          <Badge variant="secondary">Staff</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Contact & Account Information */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
                        <p className="text-sm font-mono font-semibold">{user.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Email Address</p>
                        <p className="text-sm">{user.email || "Not provided"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Account Information</CardTitle>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Account Created</p>
                        <p className="text-sm font-medium">{formatDate(user.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">User ID</p>
                        <p className="text-sm font-mono">#{user.id}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Role</p>
                        <Badge variant="secondary">{user.role?.name || "No Role"}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Orders Section - Only for Customers */}
              {isCustomer && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      <CardTitle className="text-lg">Customer Orders</CardTitle>
                    </div>
                    <CardDescription>
                      All service orders placed by this customer
                    </CardDescription>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-6">
                    {ordersLoading ? (
                      <p className="text-sm text-muted-foreground">Loading orders...</p>
                    ) : orders && orders.length > 0 ? (
                      <TableList<OrderDisplay>
                        data={orders}
                        columns={orderColumns}
                        loading={ordersLoading}
                        emptyMessage="No orders found"
                        searchableFields={[]}
                        onView={(order) => router.push(`/admin/orders/${order.order_id}/view`)}
                        showSearch={false}
                      />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No orders found for this customer</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Role Description */}
              {user.role?.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Role Description</CardTitle>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">{user.role.description}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
