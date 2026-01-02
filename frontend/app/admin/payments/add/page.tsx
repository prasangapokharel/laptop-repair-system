"use client"

import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentForm } from "@/components/payment-form"
import { Breadcrumb } from "@/components/breadcrumb"
import { useRouter } from "next/navigation"

export default function AdminAddPaymentPage() {
  const router = useRouter()

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
              { label: "Payments", href: "/admin/payments" },
              { label: "Record Payment" },
            ]}
          />

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Record Payment</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Record a new payment for an order
            </p>
          </div>

          {/* Full Width Form */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>New Payment</CardTitle>
              <CardDescription>Record a new payment transaction</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentForm
                onSuccess={() => {
                  router.push("/admin/payments")
                }}
                onError={(error) => {
                  console.error(error)
                }}
              />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
