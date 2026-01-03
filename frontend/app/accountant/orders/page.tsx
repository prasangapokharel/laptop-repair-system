"use client";
import { AccountantSidebar } from "@/components/sidebar/accountant"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { useOrders } from "@/hooks/useOrders"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { TableList, type ColumnDef } from "@/components/tables/table-list"
import { Eye, ClipboardList } from "lucide-react"
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

export default function AccountantOrdersPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const limit = 12
  const offset = (page - 1) * limit

  const { data, total, loading, error } = useOrders({ limit, offset })

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
      render: (order) => <span className="font-mono text-sm">रु {order.discount}</span>,
      sortable: true,
    },
    {
      key: "total_cost",
      header: "Total",
      render: (order) => <span className="font-mono text-sm font-semibold">रु {order.total_cost}</span>,
      sortable: true,
    },
    {
      key: "created_at",
      header: "Created",
      render: (order) => {
        const date = new Date(order.created_at)
        return <span className="text-sm">{date.toLocaleDateString()}</span>
      },
      sortable: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (order) => (
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/accountant/payments?order=${order.order_id}`)}
            className="p-1.5 hover:bg-accent rounded-md"
            title="View Payments"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  const totalPages = Math.ceil(total / limit)

  const breadcrumbItems = [
    { label: "Dashboard", href: "/accountant/dashboard" },
    { label: "Orders", href: "/accountant/orders" },
  ]

  return (
    <SidebarProvider>
      <AccountantSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Orders</h1>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          <TableList
            data={displayData}
            columns={columns}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            loading={loading}
            emptyMessage="No orders found"
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
