"use client";
import { AccountantSidebar } from "@/components/sidebar/accountant";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePayments, type Payment } from "@/hooks/usePayments";
import { usePaymentMutations } from "@/hooks/usePaymentMutations";
import { useRouter } from "next/navigation";
import { TableList, ColumnDef } from "@/components/tables/table-list";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { useState } from "react";

export default function AccountantPaymentsPage() {
  const { data, loading } = usePayments({ limit: 15, offset: 0 });
  const { deletePayment } = usePaymentMutations();
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const columns: ColumnDef<Payment>[] = [
    {
      key: "id",
      header: "Payment ID",
      render: (payment) => `#${payment.id}`,
      sortable: true,
    },
    {
      key: "order_id",
      header: "Order ID",
      render: (payment) => `#${payment.order_id}`,
      sortable: true,
    },
    {
      key: "due_amount",
      header: "Due Amount",
      render: (payment) => `रु ${payment.due_amount}`,
      sortable: true,
    },
    {
      key: "amount",
      header: "Amount Paid",
      render: (payment) => `रु ${payment.amount}`,
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (payment) => (
        <Badge
          variant={
            payment.status === "Paid"
              ? "default"
              : payment.status === "Partial"
                ? "secondary"
                : "destructive"
          }
        >
          {payment.status}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "payment_method",
      header: "Method",
      render: (payment) => payment.payment_method ?? "N/A",
      sortable: true,
    },
    {
      key: "transaction_id",
      header: "Transaction ID",
      render: (payment) => payment.transaction_id ?? "N/A",
      sortable: false,
    },
    {
      key: "paid_at",
      header: "Paid At",
      render: (payment) => payment.paid_at ?? "N/A",
      sortable: true,
    },
  ];

  const handleDelete = async (payment: Payment) => {
    try {
      await deletePayment(payment.id);
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete payment:", error);
    }
  };

  return (
    <SidebarProvider>
      <AccountantSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Payments</h1>
              <p className="text-sm text-muted-foreground">
                Manage payment records and track payment status
              </p>
            </div>
            <Button asChild>
              <Link href="/accountant/payments/add">Add Payment</Link>
            </Button>
          </div>

          <TableList<Payment>
            title="Payment Records"
            description="View and manage all payment transactions"
            data={data}
            columns={columns}
            loading={loading}
            emptyMessage="No payments found"
            searchableFields={["id", "order_id", "status", "payment_method"]}
            onView={(payment) =>
              router.push(`/accountant/payments/${payment.id}`)
            }
            onEdit={(payment) =>
              router.push(`/accountant/payments/${payment.id}/edit`)
            }
            onDelete={(payment) => setDeleteId(payment.id)}
          />

          <DeleteConfirmationDialog
            open={deleteId !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteId(null);
            }}
            title="Delete Payment"
            description="Are you sure you want to delete this payment record? This action cannot be undone."
            onConfirm={async () => {
              const payment = data.find((p) => p.id === deleteId);
              if (payment) await handleDelete(payment);
            }}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
