"use client";
import { TechnicianSidebar } from "@/components/sidebar/technician"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useOrderDetail } from "@/hooks/useOrderDetail"
import { useOrderStatusHistory } from "@/hooks/useOrders"
import { useParams } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"
import { CalendarIcon, DollarSign, Clock } from "lucide-react"

export default function TechnicianOrderViewPage() {
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
      "In Progress": "bg-blue-500",
      "Repairing": "bg-blue-500",
      "Completed": "bg-green-500",
      "Cancelled": "bg-red-500",
    }
    return colors[status] || "bg-gray-500"
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

  return (
    <SidebarProvider>
      <TechnicianSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 space-y-4 p-4 md:p-6">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/technician/dashboard" },
              { label: "Orders", href: "/technician/orders" },
              { label: `Order #${id}` },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
              <p className="text-muted-foreground text-sm mt-1">Order ID: #{id}</p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href={`/technician/orders/${id}/edit`}>Edit Order</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/technician/orders">← Back</Link>
              </Button>
            </div>
          </div>

          {loading && <p className="text-muted-foreground">Loading order details...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {!loading && !error && data && (
            <div className="grid gap-6">
              {/* Order Status Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">Order #{data.id}</CardTitle>
                      <CardDescription>Created {new Date(data.created_at).toLocaleString()}</CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(data.status)} className="text-base px-3 py-1">
                      {data.status}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Main Details Grid */}
              <div className="grid gap-6 md:grid-cols-3">
                {/* Device & Customer Information */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Device & Customer Information</CardTitle>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Device</p>
                      <p className="text-sm font-semibold">{data.device_name || `Device #${data.device_id}`}</p>
                      <p className="text-xs text-muted-foreground mt-1">ID: #{data.device_id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Customer</p>
                      <p className="text-sm font-semibold">
                        {data.customer_name || (data.customer_id ? `Customer #${data.customer_id}` : <span className="text-muted-foreground">Not assigned</span>)}
                      </p>
                      {data.customer_id && (
                        <p className="text-xs text-muted-foreground mt-1">ID: #{data.customer_id}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Problem</p>
                      <p className="text-sm font-semibold">{data.problem_name || (data.problem_id ? `Problem #${data.problem_id}` : "Not specified")}</p>
                      {data.problem_id && (
                        <p className="text-xs text-muted-foreground mt-1">ID: #{data.problem_id}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Note</p>
                      <p className="text-sm text-muted-foreground">{data.note || "No note provided"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Status History Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <CardTitle className="text-lg">Status History</CardTitle>
                    </div>
                    <CardDescription>Track all status changes</CardDescription>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-6">
                    {historyLoading ? (
                      <p className="text-sm text-muted-foreground">Loading...</p>
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
                      <p className="text-sm text-muted-foreground">No history</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Second Row: Financial and Timeline */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Financial Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Financial Details
                    </CardTitle>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-6 space-y-4">
                    <div className="border-b pb-3">
                      <p className="text-xs text-muted-foreground mb-1">Base Cost</p>
                      <p className="text-lg font-semibold font-mono">रु {data.cost}</p>
                    </div>
                    <div className="border-b pb-3">
                      <p className="text-xs text-muted-foreground mb-1">Discount</p>
                      <p className="text-lg font-semibold font-mono text-green-600">-रु {data.discount || 0}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
                      <p className="text-2xl font-bold font-mono">रु {data.total_cost}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Created</p>
                        <p className="text-sm font-medium">{new Date(data.created_at).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">{new Date(data.created_at).toLocaleTimeString()}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                        <p className="text-sm font-medium">{new Date(data.updated_at).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">{new Date(data.updated_at).toLocaleTimeString()}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg md:col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">Estimated Completion</p>
                        <p className="text-sm font-medium">
                          {data.estimated_completion_date 
                            ? new Date(data.estimated_completion_date).toLocaleDateString()
                            : "Not set"
                          }
                        </p>
                        {data.completed_at && (
                          <>
                            <p className="text-xs text-green-600 mt-1">Completed</p>
                            <p className="text-xs text-muted-foreground">{new Date(data.completed_at).toLocaleDateString()}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
