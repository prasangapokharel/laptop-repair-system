"use client"

import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePayments } from "@/hooks/usePayments"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { TableList, type ColumnDef } from "@/components/tables/table-list"
import { CreditCard, Plus } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"

interface PaymentDisplay {
  id: number
  order_id: number
  amount: string | number
  due_amount: string | number
  status: string
  payment_method: string | null
  transaction_id: string | null
  paid_at: string | null
  created_at: string
}

export default function AdminPaymentsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const limit = 15
  const offset = (page - 1) * limit

  const { data, loading, error } = usePayments({ limit, offset })

  const displayData = data.map((payment) => ({
    id: payment.id,
    order_id: payment.order_id,
    amount: payment.amount,
    due_amount: payment.due_amount,
    status: payment.status,
    payment_method: payment.payment_method,
    transaction_id: payment.transaction_id,
    paid_at: payment.paid_at,
    created_at: payment.created_at,
  }))

  const columns: ColumnDef<PaymentDisplay>[] = [
    {
      key: "id",
      header: "ID",
      render: (payment) => <span className="font-semibold text-sm">#{payment.id}</span>,
      sortable: true,
      width: "60px",
    },
    {
      key: "order_id",
      header: "Order ID",
      render: (payment) => (
        <span className="font-mono text-sm cursor-pointer text-blue-600 hover:underline">
          #{payment.order_id}
        </span>
      ),
      sortable: true,
    },
    {
      key: "amount",
      header: "Amount Paid",
      render: (payment) => <span className="font-mono font-medium">रु {payment.amount}</span>,
      sortable: true,
    },
    {
      key: "due_amount",
      header: "Due Amount",
      render: (payment) => (
        <span className="font-mono text-sm text-orange-600">रु {payment.due_amount}</span>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (payment) => {
        const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
          "Paid": "default",
          "Partial": "secondary",
          "Pending": "outline",
        }
        return (
          <Badge variant={variants[payment.status] || "outline"} className="text-xs">
            {payment.status}
          </Badge>
        )
      },
      sortable: true,
    },
    {
      key: "payment_method",
      header: "Method",
      render: (payment) => (
        <span className="text-sm text-muted-foreground">{payment.payment_method || "—"}</span>
      ),
      sortable: true,
    },
    {
      key: "transaction_id",
      header: "Transaction ID",
      render: (payment) => (
        <span className="font-mono text-xs text-muted-foreground">
          {payment.transaction_id || "—"}
        </span>
      ),
      sortable: false,
    },
    {
      key: "created_at",
      header: "Created",
      render: (payment) => (
        <span className="text-sm text-muted-foreground">
          {new Date(payment.created_at).toLocaleDateString()}
        </span>
      ),
      sortable: true,
    },
  ]

  const totalPages = Math.ceil(data.length / limit)

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
              { label: "Payments" },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <CreditCard className="h-8 w-8" />
                Payments Management
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                View and manage all payment transactions
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/admin/payments/add">
                <Plus className="h-4 w-4" />
                Record Payment
              </Link>
            </Button>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
              <p className="text-sm text-destructive">Error: {error}</p>
            </div>
          )}

          <TableList<PaymentDisplay>
            title="All Payments"
            description={`Total: ${data.length} payments`}
            data={displayData}
            columns={columns}
            loading={loading}
            emptyMessage="No payments found in the system"
            searchableFields={["order_id", "status"]}
            onEdit={(payment) => router.push(`/admin/payments/${payment.id}/edit`)}
            itemsPerPage={limit}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
