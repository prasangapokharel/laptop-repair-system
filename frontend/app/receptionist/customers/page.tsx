"use client"

import { ReceptionistSidebar } from "@/components/sidebar/receptionist"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { TableList, type ColumnDef } from "@/components/tables/table-list"
import { useUsers } from "@/hooks/useUsers"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Users } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"

interface Customer {
  id: number
  full_name: string
  phone: string
  email: string
  is_active: boolean
  created_at: string
}

export default function ReceptionistCustomersPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const limit = 12
  const offset = (page - 1) * limit

  const { data: customers, total, loading, error } = useUsers(limit, offset)

  const columns: ColumnDef<Customer>[] = [
    {
      key: "id",
      header: "ID",
      render: (customer) => <span className="font-semibold text-sm">#{customer.id}</span>,
      sortable: true,
    },
    {
      key: "full_name",
      header: "Full Name",
      sortable: true,
    },
    {
      key: "phone",
      header: "Phone",
      render: (customer) => <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{customer.phone}</span>,
      sortable: true,
    },
    {
      key: "email",
      header: "Email",
      render: (customer) => (
        <span className="text-sm text-primary hover:underline cursor-pointer">{customer.email || "N/A"}</span>
      ),
      sortable: true,
    },
    {
      key: "is_active",
      header: "Status",
      render: (customer) => (
        <Badge variant={customer.is_active ? "default" : "secondary"}>
          {customer.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
      sortable: false,
    },
    {
      key: "created_at",
      header: "Joined",
      render: (customer) => {
        const d = new Date(customer.created_at)
        return <span className="text-sm text-muted-foreground">{d.toLocaleDateString()}</span>
      },
      sortable: true,
    },
  ]

  return (
    <SidebarProvider>
      <ReceptionistSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 space-y-4 p-4 md:p-6">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/receptionist/dashboard" },
              { label: "Customers" },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Users className="h-8 w-8" />
                Customers
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Manage and view all customer information and their orders</p>
            </div>
          </div>

          <TableList<Customer>
            title="All Customers"
            description="View and manage customer details, contact information, and account status"
            data={customers}
            columns={columns}
            loading={loading}
            emptyMessage="No customers found in the system"
            searchableFields={["full_name", "phone", "email"]}
            onView={(customer) => router.push(`/receptionist/customers/${customer.id}`)}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
