"use client"
import { TechnicianSidebar } from "@/components/sidebar/technician"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { OrderCreationForm } from "@/components/order-creation-form"
import { useRouter } from "next/navigation"

export default function TechnicianAddOrderPage() {
  const router = useRouter()

  return (
    <SidebarProvider>
      <TechnicianSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between space-y-2 py-4">
            <h2 className="text-3xl font-bold tracking-tight">Create Order</h2>
          </div>
          <div className="w-full">
            <Card className="w-full">
              <CardContent className="p-6">
                <OrderCreationForm
                  onSuccess={(orderId) => {
                    router.push(`/technician/orders/${orderId}/view`)
                  }}
                  onError={(error) => {
                    console.error(error)
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
