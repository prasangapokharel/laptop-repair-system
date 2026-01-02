"use client";
import { CustomerSidebar } from "@/components/sidebar/customer";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useOrders, type Order } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { TableList, ColumnDef } from "@/components/tables/table-list";
import { Badge } from "@/components/ui/badge";

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const { data, loading } = useOrders({
    customer_id: user?.id ? Number(user.id) : undefined,
    limit: 15,
    offset: 0,
  });
  const router = useRouter();

  const columns: ColumnDef<Order>[] = [
    {
      key: "id",
      header: "Order ID",
      render: (order) => `#${order.id}`,
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
      header: "Total Cost",
      render: (order) => `रु ${order.total_cost}`,
      sortable: true,
    },
    {
      key: "estimated_completion_date",
      header: "Est. Completion",
      render: (order) => order.estimated_completion_date ?? "N/A",
      sortable: true,
    },
  ];

  return (
    <SidebarProvider>
      <CustomerSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">My Orders</h1>
            <p className="text-sm text-muted-foreground">
              Track your service requests and their status
            </p>
          </div>

          <TableList<Order>
            title="Service Orders"
            description="View your submitted orders and their progress"
            data={data}
            columns={columns}
            loading={loading}
            emptyMessage="No orders found"
            searchableFields={["id", "status", "note"]}
            onView={(order) => router.push(`/customer/orders/${order.id}`)}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
