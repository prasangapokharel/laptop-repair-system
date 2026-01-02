"use client";
import { ReceptionistSidebar } from "@/components/sidebar/receptionist"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useOrders } from "@/hooks/useOrders"
import { useOrderMutations } from "@/hooks/useOrderMutations"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { TableList } from "@/components/tables/table-list"
import { Edit, Eye, Trash2, Plus, ClipboardList } from "lucide-react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Breadcrumb } from "@/components/breadcrumb"

export default function ReceptionistOrdersPage() {
  const [page, setPage] = useState(1)
  const limit = 12
  const offset = (page - 1) * limit

  const { data, total, loading, error } = useOrders({ limit, offset })
  const { deleteOrder, loading: deleteLoading } = useOrderMutations()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteOrderId, setDeleteOrderId] = useState<number | null>(null)

  const columns = [
    {
      key: "id",
      label: "Order ID",
      render: (id: number) => <span className="font-semibold text-sm">#{id}</span>,
      searchable: true,
    },
    {
      key: "device_id",
      label: "Device ID",
      render: (id: number) => <span className="font-mono text-sm">#{id}</span>,
    },
    {
      key: "problem",
      label: "Problem",
      render: (problem: any) => <span className="text-sm">{problem?.name || "N/A"}</span>,
      searchable: true,
    },
    {
      key: "status",
      label: "Status",
      render: (status: string) => {
        const variants: Record<string, string> = {
          "Pending": "secondary",
          "In Progress": "default",
          "Completed": "default",
          "Cancelled": "destructive",
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
      key: "discount",
      label: "Discount",
      render: (discount: number) => <span className="font-mono text-sm text-green-600">-रु {discount || 0}</span>,
    },
    {
      key: "total_cost",
      label: "Total",
      render: (total: number) => <span className="font-mono font-semibold text-sm">रु {total}</span>,
    },
    {
      key: "created_at",
      label: "Created",
      render: (date: string) => (
        <span className="text-sm text-muted-foreground">{new Date(date).toLocaleDateString()}</span>
      ),
    },
  ]

  const handleDeleteOrder = async (id: number) => {
    setDeleteOrderId(id)
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

          <TableList
            title="All Orders"
            description="Browse and manage all customer service orders with status, cost, and details"
            data={data}
            columns={columns}
            isLoading={loading}
            error={error}
            totalCount={total}
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
              {
                label: "Delete",
                icon: <Trash2 className="h-4 w-4" />,
                onClick: handleDeleteOrder,
                className: "text-red-600",
              },
            ]}
            emptyMessage="No orders found in the system"
            showSearch={true}
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
