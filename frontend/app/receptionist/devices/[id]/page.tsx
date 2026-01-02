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
import { useDeviceDetail } from "@/hooks/useDeviceDetail"
import { useOrders, type Order } from "@/hooks/useOrders"
import { useState } from "react"
import { TableList } from "@/components/tables/table-list"
import { Edit, Eye, Cpu, Package } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"

export default function ReceptionistDeviceDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const { data: device, loading: deviceLoading, error: deviceError } = useDeviceDetail(id)

  const [page, setPage] = useState(1)
  const limit = 10
  const offset = (page - 1) * limit

  const { data: orders, total: ordersTotal, loading: ordersLoading, error: ordersError } = useOrders({
    limit,
    offset,
  })

  // Filter orders for this device
  const deviceOrders = orders.filter((order: any) => order.device_id === id)

  const columns = [
    {
      key: "id",
      header: "Order ID",
      render: (order: Order) => <span className="font-semibold text-sm">#{order.id}</span>,
    },
    {
      key: "problem",
      header: "Problem",
      render: (order: Order) => <span className="text-sm">{order.problem?.name || "N/A"}</span>,
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
              { label: "Devices", href: "/receptionist/devices" },
              { label: "Device Details" },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Device Details</h1>
              <p className="text-muted-foreground text-sm mt-1">View device information and service history</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/receptionist/devices">← Back</Link>
            </Button>
          </div>

          {deviceLoading && <p className="text-muted-foreground">Loading device information...</p>}
          {deviceError && <p className="text-red-500">Error: {deviceError}</p>}

          {!deviceLoading && !deviceError && device && (
            <>
              {/* Device Information Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">
                        {device.brand?.name} {device.model?.name}
                      </CardTitle>
                      <CardDescription>Device ID: #{device.id}</CardDescription>
                    </div>
                    <Badge variant="outline">{device.device_type?.name || "Unknown Type"}</Badge>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Device Specifications */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-muted-foreground">DEVICE SPECIFICATIONS</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Brand</p>
                            <p className="text-sm font-medium">{device.brand?.name || "N/A"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Cpu className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Model</p>
                            <p className="text-sm font-medium">{device.model?.name || "N/A"}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Type</p>
                          <Badge variant="secondary">{device.device_type?.name || "Unknown"}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Device Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-muted-foreground">DEVICE INFORMATION</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Serial Number</p>
                          <p className="text-sm font-mono bg-muted p-2 rounded">
                            {device.serial_number || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Device ID</p>
                          <p className="text-sm font-mono">{device.id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service History */}
              <Card>
                <CardHeader>
                  <CardTitle>Service History</CardTitle>
                  <CardDescription>
                    {deviceOrders.length} service record{deviceOrders.length !== 1 ? "s" : ""} for this device
                  </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  {deviceOrders.length > 0 ? (
                    <>
                      {ordersLoading && <p className="text-muted-foreground">Loading orders...</p>}
                      {ordersError && <p className="text-red-500">Error: {ordersError}</p>}
                      {!ordersLoading && !ordersError && (
                        <TableList
                          data={deviceOrders}
                          columns={columns}
                          loading={ordersLoading}
                          emptyMessage="No service orders found for this device"
                          searchableFields={["status"]}
                        />
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No service orders found for this device</p>
                    </div>
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
