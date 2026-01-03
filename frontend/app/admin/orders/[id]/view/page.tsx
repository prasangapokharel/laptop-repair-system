"use client";
import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useOrderDetail } from "@/hooks/useOrderDetail"
import { useOrderStatusHistory } from "@/hooks/useOrders"
import { useParams } from "next/navigation"
import { Clock } from "lucide-react"

export default function AdminOrderViewPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const { data, loading, error } = useOrderDetail(id)
  const { data: history, loading: historyLoading } = useOrderStatusHistory(id)

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Pending": "bg-yellow-500",
      "Repairing": "bg-blue-500",
      "Completed": "bg-green-500",
      "Cancelled": "bg-red-500",
    }
    return colors[status] || "bg-gray-500"
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Order #{id}</h2>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/admin/orders/${id}/edit`}>Edit Order</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/orders">Back to Orders</Link>
              </Button>
            </div>
          </div>
          
          {loading && <p className="text-muted-foreground">Loading order...</p>}
          {error && <p className="text-destructive">{error}</p>}
          
          {!loading && !error && data && (
            <div className="grid gap-4 md:grid-cols-3">
              {/* Order Details Card */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                  <CardDescription>Complete information about this repair order</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Device</p>
                      <p className="text-sm">{data.device_name || `Device #${data.device_id}`}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Customer</p>
                      <p className="text-sm">{data.customer_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Problem</p>
                      <p className="text-sm">{data.problem_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge>{data.status}</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cost</p>
                      <p className="text-lg font-semibold">रु {data.cost}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Discount</p>
                      <p className="text-lg font-semibold">रु {data.discount}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                      <p className="text-2xl font-bold text-primary">रु {data.total_cost}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Note</p>
                      <p className="text-sm">{data.note || "No notes"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Estimated Completion</p>
                        <p className="text-sm">{data.estimated_completion_date ? formatDate(data.estimated_completion_date) : "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Completed At</p>
                        <p className="text-sm">{data.completed_at ? formatDate(data.completed_at) : "N/A"}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Created At</p>
                        <p className="text-sm">{formatDate(data.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                        <p className="text-sm">{formatDate(data.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status History Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <CardTitle>Status History</CardTitle>
                  </div>
                  <CardDescription>Track all status changes for this order</CardDescription>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <p className="text-sm text-muted-foreground">Loading history...</p>
                  ) : history && history.length > 0 ? (
                    <div className="relative space-y-4">
                      {/* Timeline line */}
                      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />
                      
                      {history.map((item, index) => (
                        <div key={item.id} className="relative flex gap-3">
                          {/* Status dot */}
                          <div className={`relative z-10 flex h-4 w-4 items-center justify-center rounded-full ${getStatusColor(item.status)} ring-4 ring-background`} />
                          
                          {/* Content */}
                          <div className="flex-1 space-y-1 pb-4">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold">{item.status}</p>
                              {index === 0 && (
                                <Badge variant="outline" className="text-xs">Current</Badge>
                              )}
                            </div>
                            {item.note && (
                              <p className="text-xs text-muted-foreground">{item.note}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {formatDate(item.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No status history available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

