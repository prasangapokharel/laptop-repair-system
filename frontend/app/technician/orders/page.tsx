"use client";
import { TechnicianSidebar } from "@/components/sidebar/technician";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useOrders, type Order } from "@/hooks/useOrders";
import { useRouter } from "next/navigation";
import { TableList, ColumnDef } from "@/components/tables/table-list";
import { Badge } from "@/components/ui/badge";

export default function TechnicianOrdersPage() {
  const { data, loading } = useOrders({ limit: 15, offset: 0 });
  const router = useRouter();

  const columns: ColumnDef<Order>[] = [
    {
      key: "id",
      header: "Order ID",
      render: (order) => `#${order.id}`,
      sortable: true,
    },
    {
      key: "device_id",
      header: "Device ID",
      render: (order) => `#${order.device_id}`,
      sortable: true,
    },
    {
      key: "problem_id",
      header: "Problem",
      render: (order) => order.problem?.name ?? `#${order.problem_id}`,
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (order) => (
        <Badge
          variant={
            order.status === "completed"
              ? "default"
              : order.status === "pending"
                ? "secondary"
                : "destructive"
          }
        >
          {order.status}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "cost",
      header: "Cost",
      render: (order) => `रु ${order.cost}`,
      sortable: true,
    },
    {
      key: "discount",
      header: "Discount",
      render: (order) => `रु ${order.discount}`,
      sortable: true,
    },
    {
      key: "total_cost",
      header: "Total",
      render: (order) => `रु ${order.total_cost}`,
      sortable: true,
    },
  ];

  return (
    <SidebarProvider>
      <TechnicianSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Orders</h1>
            <p className="text-sm text-muted-foreground">
              View assigned service orders
            </p>
          </div>

          <TableList<Order>
            title="Service Orders"
            description="Browse orders assigned to you"
            data={data}
            columns={columns}
            loading={loading}
            emptyMessage="No orders assigned"
            searchableFields={["id", "device_id", "status", "note"]}
            onView={(order) => router.push(`/technician/orders/${order.id}`)}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
