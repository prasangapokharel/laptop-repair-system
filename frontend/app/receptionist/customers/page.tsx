"use client"

import { ReceptionistSidebar } from "@/components/sidebar/receptionist"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TableList } from "@/components/tables/table-list"
import { useUsers } from "@/hooks/useUsers"
import { useState } from "react"
import Link from "next/link"
import { Eye, Users } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"

export default function ReceptionistCustomersPage() {
  const [page, setPage] = useState(1)
  const limit = 12
  const offset = (page - 1) * limit

  const { data: customers, total, loading, error } = useUsers(limit, offset)

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (id: number) => <span className="font-semibold text-sm">#{id}</span>,
      searchable: true,
    },
    {
      key: "full_name",
      label: "Full Name",
      searchable: true,
    },
    {
      key: "phone",
      label: "Phone",
      render: (phone: string) => <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{phone}</span>,
      searchable: true,
    },
    {
      key: "email",
      label: "Email",
      render: (email: string) => (
        <span className="text-sm text-primary hover:underline cursor-pointer">{email || "N/A"}</span>
      ),
      searchable: true,
    },
    {
      key: "is_active",
      label: "Status",
      render: (isActive: boolean) => (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Joined",
      render: (date: string) => {
        const d = new Date(date)
        return <span className="text-sm text-muted-foreground">{d.toLocaleDateString()}</span>
      },
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

          <TableList
            title="All Customers"
            description="View and manage customer details, contact information, and account status"
            data={customers}
            columns={columns}
            isLoading={loading}
            error={error}
            totalCount={total}
            currentPage={page}
            pageSize={limit}
            onPageChange={setPage}
            actions={[
              {
                label: "View Profile",
                icon: <Eye className="h-4 w-4" />,
                href: (id) => `/receptionist/customers/${id}`,
              },
            ]}
            emptyMessage="No customers found in the system"
            showSearch={true}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
