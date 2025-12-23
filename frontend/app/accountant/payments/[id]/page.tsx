"use client";
import { AccountantSidebar } from "@/components/sidebar/accountant"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePaymentDetail } from "@/hooks/usePaymentDetail"
import { useParams } from "next/navigation"

export default function AccountantPaymentDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const { data, loading, error } = usePaymentDetail(id)

  return (
    <SidebarProvider>
      <AccountantSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Payment #{id}</h2>
            <Button variant="outline" asChild>
              <Link href={`/accountant/payments/${id}/edit`}>Edit</Link>
            </Button>
          </div>
          <Separator className="my-4" />
          {loading && <p>Loading payment...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && data && (
            <div className="rounded-lg border p-4 bg-card shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 text-sm">
                <p>Order ID: {data.order_id}</p>
                <p>Status: {data.status}</p>
                <p>Due Amount: रु {data.due_amount}</p>
                <p>Amount: रु {data.amount}</p>
                <p>Method: {data.payment_method ?? "N/A"}</p>
                <p>Transaction: {data.transaction_id ?? "N/A"}</p>
                <p>Paid At: {data.paid_at ?? "N/A"}</p>
                <p>Created At: {data.created_at}</p>
                <p>Updated At: {data.updated_at}</p>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
