"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, PackageCheck, Search, Eye, Truck } from "lucide-react"
import { useOrders } from "@/hooks/useOrders"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ReceptionistDispatchPage() {
  const router = useRouter()
  const { orders, loading, error, updateOrder } = useOrders()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isDispatchDialogOpen, setIsDispatchDialogOpen] = useState(false)
  const [dispatchNotes, setDispatchNotes] = useState("")

  // Filter orders ready for dispatch (status = Completed)
  const readyForDispatch = orders?.filter((order: any) => 
    order.status === "Completed" || order.status === "Ready for Pickup"
  )

  // Filter orders already dispatched
  const dispatched = orders?.filter((order: any) => 
    order.status === "Dispatched" || order.status === "Delivered"
  )

  const filteredOrders = orders?.filter((order: any) => {
    const matchesSearch = searchTerm === "" || 
      order.id.toString().includes(searchTerm) ||
      order.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.phone?.includes(searchTerm) ||
      order.device?.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = true
    if (filterStatus === "ready") {
      matchesStatus = order.status === "Completed" || order.status === "Ready for Pickup"
    } else if (filterStatus === "dispatched") {
      matchesStatus = order.status === "Dispatched" || order.status === "Delivered"
    } else if (filterStatus !== "all") {
      matchesStatus = order.status === filterStatus
    }

    return matchesSearch && matchesStatus
  })

  const openDispatchDialog = (order: any) => {
    setSelectedOrder(order)
    setDispatchNotes("")
    setIsDispatchDialogOpen(true)
  }

  const handleDispatch = async () => {
    if (!selectedOrder) return

    try {
      await updateOrder(selectedOrder.id, {
        status: "Dispatched",
        notes: dispatchNotes || selectedOrder.notes,
      })
      
      toast.success(`Order #${selectedOrder.id} dispatched successfully`)
      setIsDispatchDialogOpen(false)
      setSelectedOrder(null)
      setDispatchNotes("")
    } catch (error) {
      toast.error("Failed to dispatch order")
      console.error(error)
    }
  }

  const handleMarkAsDelivered = async (orderId: number) => {
    if (!confirm("Mark this order as delivered?")) return

    try {
      await updateOrder(orderId, {
        status: "Delivered",
      })
      
      toast.success(`Order #${orderId} marked as delivered`)
    } catch (error) {
      toast.error("Failed to mark as delivered")
      console.error(error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      "Completed": "bg-green-500",
      "Ready for Pickup": "bg-blue-500",
      "Dispatched": "bg-purple-500",
      "Delivered": "bg-gray-500",
    }
    return (
      <Badge className={statusColors[status] || "bg-gray-500"}>
        {status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Error loading orders: {error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dispatch Management</h1>
          <p className="text-muted-foreground">Manage device dispatch and delivery</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Dispatch</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readyForDispatch?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Completed repairs awaiting dispatch
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispatched</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dispatched?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Orders currently dispatched/delivered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              All orders in the system
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dispatch Queue</CardTitle>
          <CardDescription>Manage order dispatch and delivery status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Order ID, Customer Name, Phone, or Serial Number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="ready">Ready for Dispatch</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completed Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders && filteredOrders.length > 0 ? (
                filteredOrders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => router.push(`/receptionist/orders/${order.id}/view`)}
                      >
                        #{order.id}
                      </Button>
                    </TableCell>
                    <TableCell>{order.customer?.full_name || "-"}</TableCell>
                    <TableCell>{order.customer?.phone || "-"}</TableCell>
                    <TableCell>
                      {order.device?.brand?.name || "-"} {order.device?.model?.name || "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {order.updated_at
                        ? new Date(order.updated_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/receptionist/orders/${order.id}/view`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {(order.status === "Completed" || order.status === "Ready for Pickup") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDispatchDialog(order)}
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            Dispatch
                          </Button>
                        )}
                        {order.status === "Dispatched" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsDelivered(order.id)}
                          >
                            <PackageCheck className="h-4 w-4 mr-1" />
                            Mark Delivered
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dispatch Dialog */}
      <Dialog open={isDispatchDialogOpen} onOpenChange={setIsDispatchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispatch Order #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Confirm device dispatch to customer
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Customer Name</Label>
              <Input value={selectedOrder?.customer?.full_name || "-"} disabled />
            </div>
            <div className="grid gap-2">
              <Label>Phone Number</Label>
              <Input value={selectedOrder?.customer?.phone || "-"} disabled />
            </div>
            <div className="grid gap-2">
              <Label>Device</Label>
              <Input 
                value={`${selectedOrder?.device?.brand?.name || ""} ${selectedOrder?.device?.model?.name || ""}`} 
                disabled 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dispatch_notes">Dispatch Notes (Optional)</Label>
              <Textarea
                id="dispatch_notes"
                placeholder="Add any dispatch notes or instructions..."
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDispatchDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDispatch}>
              <Truck className="h-4 w-4 mr-2" />
              Confirm Dispatch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
