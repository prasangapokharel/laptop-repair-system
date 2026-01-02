"use client";
import { TechnicianSidebar } from "@/components/sidebar/technician";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useOrders, type Order } from "@/hooks/useOrders";
import { useRouter } from "next/navigation";
import { TableList, ColumnDef } from "@/components/tables/table-list";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/breadcrumb";
import { ClipboardList } from "lucide-react";

interface OrderDisplay {
  order_id: number
  customer_name: string | null
  device_name: string | null
  problem_name: string | null
  status: string
  cost: string | number
  discount: string | number
  total_cost: string | number
  created_at: string
}

export default function TechnicianOrdersPage() {
  const { data, loading } = useOrders({ limit: 15, offset: 0 });
  const router = useRouter();

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
  }));

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
      render: (order) => (
        <Badge
          variant={
            order.status === "Completed"
              ? "default"
              : order.status === "Pending"
                ? "secondary"
                : order.status === "In Progress"
                  ? "default"
                  : "destructive"
          }
          className="text-xs"
        >
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
  ];

  return (
    <SidebarProvider>
      <TechnicianSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 space-y-4 p-4 md:p-6">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/technician/dashboard" },
              { label: "Orders" },
            ]}
          />

          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <ClipboardList className="h-8 w-8" />
              Assigned Orders
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              View and manage all assigned service orders
            </p>
          </div>

          <TableList<OrderDisplay>
            title="Service Orders"
            description="Browse orders assigned to you"
            data={displayData}
            columns={columns}
            loading={loading}
            emptyMessage="No orders assigned"
            searchableFields={["order_id", "device_name", "problem_name", "status"]}
            onView={(order) => router.push(`/technician/orders/${order.order_id}`)}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
