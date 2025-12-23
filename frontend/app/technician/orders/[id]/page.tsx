"use client";
import { TechnicianSidebar } from "@/components/sidebar/technician"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useOrderDetail } from "@/hooks/useOrderDetail"
import { useParams } from "next/navigation"

export default function TechnicianOrderDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const { data, loading, error } = useOrderDetail(id)

  return (
    <SidebarProvider>
      <TechnicianSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Order #{id}</h2>
            <Button variant="outline" asChild>
              <Link href={`/technician/orders`}>Back</Link>
            </Button>
          </div>
          <Separator className="my-4" />
          {loading && <p>Loading order...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && data && (
            <div className="rounded-lg border p-4 bg-card shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 text-sm">
                <p>Device ID: {data.device_id}</p>
                <p>Customer ID: {data.customer_id ?? "N/A"}</p>
                <p>Total: रु {data.total_cost}</p>
                <p>Cost: रु {data.cost}</p>
                <p>Discount: रु {data.discount}</p>
                <p>Status: {data.status}</p>
                <p>Note: {data.note ?? "N/A"}</p>
                <p>ETA: {data.estimated_completion_date ?? "N/A"}</p>
                <p>Completed At: {data.completed_at ?? "N/A"}</p>
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
