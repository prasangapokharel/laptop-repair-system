"use client"

import { ReceptionistSidebar } from "@/components/sidebar/receptionist"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { TableList } from "@/components/tables/table-list"
import Link from "next/link"
import { useProblems, useProblemMutations } from "@/hooks/useProblems"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus, AlertCircle } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"

export default function ReceptionistProblemsPage() {
  const [page, setPage] = useState(1)
  const limit = 12
  const offset = (page - 1) * limit

  const { data: problems, total, loading, error } = useProblems(limit, offset)
  const { deleteProblem } = useProblemMutations()

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (id: number) => <span className="font-semibold text-sm">#{id}</span>,
      searchable: true,
    },
    {
      key: "name",
      label: "Problem Name",
      searchable: true,
    },
    {
      key: "description",
      label: "Description",
      render: (desc: string | null) => (
        <p className="text-sm text-muted-foreground truncate max-w-xs">{desc || "N/A"}</p>
      ),
      searchable: true,
    },
    {
      key: "device_type",
      label: "Device Type",
      render: (type: any) => (
        <Badge variant="outline">{type?.name || "Unknown"}</Badge>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (date: string) => {
        const d = new Date(date)
        return <span className="text-sm text-muted-foreground">{d.toLocaleDateString()}</span>
      },
    },
  ]

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this problem? This action cannot be undone.")) {
      try {
        await deleteProblem(id)
        window.location.reload()
      } catch (err) {
        alert("Failed to delete problem")
      }
    }
  }

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
              { label: "Problems" },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <AlertCircle className="h-8 w-8" />
                Problems/Issues
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Manage device problems and issue categories</p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/receptionist/problem/add">
                <Plus className="h-4 w-4" />
                Add Problem
              </Link>
            </Button>
          </div>

          <TableList
            title="All Problems"
            description="View and manage all device problems and issues that customers report"
            data={problems}
            columns={columns}
            isLoading={loading}
            error={error}
            totalCount={total}
            currentPage={page}
            pageSize={limit}
            onPageChange={setPage}
            actions={[
              {
                label: "Edit",
                icon: <Edit className="h-4 w-4" />,
                href: (id) => `/receptionist/problem/${id}/edit`,
              },
              {
                label: "Delete",
                icon: <Trash2 className="h-4 w-4" />,
                onClick: handleDelete,
                className: "text-red-600",
              },
            ]}
            emptyMessage="No problems found in the system"
            showSearch={true}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
