"use client"

import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useOrders } from "@/hooks/useOrders"
import { useOrderMutations } from "@/hooks/useOrderMutations"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { TableList, type ColumnDef } from "@/components/tables/table-list"
import { ClipboardList, Plus } from "lucide-react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Breadcrumb } from "@/components/breadcrumb"

interface OrderDisplay {
  id: number
  device_id: number
  problem_name: string
  status: string
  cost: string | number
  discount: string | number
  total_cost: string | number
  created_at: string
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const limit = 15
  const offset = (page - 1) * limit

  const { data, total, loading, error } = useOrders({ limit, offset })
  const { deleteOrder, loading: deleteLoading } = useOrderMutations()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteOrderId, setDeleteOrderId] = useState<number | null>(null)

  const displayData = data.map((order) => ({
    id: order.id,
    device_id: order.device_id,
    problem_name: order.problem?.name || "—",
    status: order.status,
    cost: order.cost,
    discount: order.discount,
    total_cost: order.total_cost,
    created_at: order.created_at,
  }))

  const columns: ColumnDef<OrderDisplay>[] = [
    {
      key: "id",
      header: "Order ID",
      render: (order) => <span className="font-semibold text-sm">#{order.id}</span>,
      sortable: true,
      width: "80px",
    },
    {
      key: "device_id",
      header: "Device ID",
      render: (order) => <span className="font-mono text-sm">#{order.device_id}</span>,
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
          <Badge variant={variants[order.status] || "outline"} className="text-xs">
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
      render: (order) => (
        <span className="font-mono text-sm text-green-600">-रु {order.discount || 0}</span>
      ),
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

  const handleDeleteOrder = (order: OrderDisplay) => {
    setDeleteOrderId(order.id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteOrderId) return
    try {
      await deleteOrder(deleteOrderId)
      setDeleteDialogOpen(false)
      setDeleteOrderId(null)
      router.refresh()
    } catch (err) {
      console.error("Failed to delete order:", err)
    }
  }

  const totalPages = Math.ceil(total / limit)

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
              { label: "Orders" },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <ClipboardList className="h-8 w-8" />
                Orders Management
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                View and manage all service orders
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/admin/orders/add">
                <Plus className="h-4 w-4" />
                Create Order
              </Link>
            </Button>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
              <p className="text-sm text-destructive">Error: {error}</p>
            </div>
          )}

          <TableList<OrderDisplay>
            title="All Orders"
            description={`Showing ${displayData.length} of ${total} total orders`}
            data={displayData}
            columns={columns}
            loading={loading}
            emptyMessage="No orders found in the system"
            searchableFields={["id", "device_id", "problem_name", "status"]}
            onView={(order) => router.push(`/admin/orders/${order.id}`)}
            onEdit={(order) => router.push(`/admin/orders/${order.id}/edit`)}
            onDelete={handleDeleteOrder}
            itemsPerPage={limit}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(Math.max(1, page - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
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
