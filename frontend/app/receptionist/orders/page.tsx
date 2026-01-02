"use client";
import { ReceptionistSidebar } from "@/components/sidebar/receptionist"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useOrders } from "@/hooks/useOrders"
import { useOrderMutations } from "@/hooks/useOrderMutations"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { TableList, type ColumnDef } from "@/components/tables/table-list"
import { Edit, Eye, Trash2, Plus, ClipboardList } from "lucide-react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Breadcrumb } from "@/components/breadcrumb"

interface OrderDisplay {
  order_id: number
  customer_name: string | null
  device_name: string | null
  problem_name: string | null
  status: string
  cost: string
  discount: string
  total_cost: string
  created_at: string
}

export default function ReceptionistOrdersPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const limit = 12
  const offset = (page - 1) * limit

  const { data, total, loading, error } = useOrders({ limit, offset })
  const { deleteOrder, loading: deleteLoading } = useOrderMutations()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteOrderId, setDeleteOrderId] = useState<number | null>(null)

  const displayData = data.map((order) => ({
    order_id: order.order_id,
    customer_name: order.customer_name || "—",
    device_name: order.device_name || "—",
    problem_name: order.problem_name || "—",
    status: order.status,
    cost: order.cost,
    discount: order.discount,
    total_cost: order.total_cost,
    created_at: order.created_at,
  }))

  const columns: ColumnDef<OrderDisplay>[] = [
    {
      key: "order_id",
      header: "Order ID",
      render: (order) => <span className="font-semibold text-sm">#{order.order_id}</span>,
      sortable: true,
    },
    {
      key: "customer_name",
      header: "Customer",
      render: (order) => <span className="text-sm">{order.customer_name}</span>,
      sortable: true,
    },
    {
      key: "device_name",
      header: "Device",
      render: (order) => <span className="text-sm">{order.device_name}</span>,
      sortable: true,
    },
    {
      key: "problem_name",
      header: "Problem",
      render: (order) => <span className="text-sm">{order.problem_name}</span>,
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (order) => {
        const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
          "Pending": "secondary",
          "In Progress": "default",
          "Completed": "default",
          "Cancelled": "destructive",
        }
        return (
          <Badge variant={variants[order.status] || "outline"}>
            {order.status}
          </Badge>
        )
      },
      sortable: true,
    },
    {
      key: "cost",
      header: "Cost",
      render: (order) => <span className="font-mono text-sm">रु {order.cost}</span>,
      sortable: true,
    },
    {
      key: "discount",
      header: "Discount",
      render: (order) => <span className="font-mono text-sm text-green-600">-रु {order.discount || 0}</span>,
      sortable: true,
    },
    {
      key: "total_cost",
      header: "Total",
      render: (order) => <span className="font-mono font-semibold text-sm">रु {order.total_cost}</span>,
      sortable: true,
    },
    {
      key: "created_at",
      header: "Created",
      render: (order) => (
        <span className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</span>
      ),
      sortable: true,
    },
  ]

  const handleDeleteOrder = async (order: OrderDisplay) => {
    setDeleteOrderId(order.order_id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteOrderId) return
    try {
      await deleteOrder(deleteOrderId)
      setDeleteDialogOpen(false)
      setDeleteOrderId(null)
      window.location.reload()
    } catch (err) {
      console.error("Failed to delete order:", err)
    }
  }

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
              { label: "Orders" },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <ClipboardList className="h-8 w-8" />
                Orders
              </h1>
              <p className="text-muted-foreground text-sm mt-1">View and manage all service orders in the system</p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/receptionist/orders/add">
                <Plus className="h-4 w-4" />
                Create Order
              </Link>
            </Button>
          </div>

          <TableList<OrderDisplay>
            title="All Orders"
            description="Browse and manage all customer service orders with status, cost, and details"
            data={displayData}
            columns={columns}
            loading={loading}
            emptyMessage="No orders found in the system"
            searchableFields={["order_id", "device_name", "problem_name", "status"]}
            onView={(order) => router.push(`/receptionist/orders/${order.order_id}`)}
            onEdit={(order) => router.push(`/receptionist/orders/${order.order_id}/edit`)}
            onDelete={handleDeleteOrder}
          />
        </div>
      </SidebarInset>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Order"
        description={`Are you sure you want to delete order #${deleteOrderId}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </SidebarProvider>
  )
}
