"use client"

import { ReceptionistSidebar } from "@/components/sidebar/receptionist"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { TableList, type ColumnDef } from "@/components/tables/table-list"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useProblems, useProblemMutations } from "@/hooks/useProblems"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus, AlertCircle } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"

interface Problem {
  id: number
  name: string
  description: string | null
  device_type?: { id: number; name: string }
  created_at: string
}

export default function ReceptionistProblemsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const limit = 12
  const offset = (page - 1) * limit

  const { data: problems, total, loading, error } = useProblems(limit, offset)
  const { deleteProblem } = useProblemMutations()

  const columns: ColumnDef<Problem>[] = [
    {
      key: "id",
      header: "ID",
      render: (problem) => <span className="font-semibold text-sm">#{problem.id}</span>,
      sortable: true,
    },
    {
      key: "name",
      header: "Problem Name",
      sortable: true,
    },
    {
      key: "description",
      header: "Description",
      render: (problem) => (
        <p className="text-sm text-muted-foreground truncate max-w-xs">{problem.description || "N/A"}</p>
      ),
      sortable: false,
    },
    {
      key: "device_type",
      header: "Device Type",
      render: (problem) => (
        <Badge variant="outline">{problem.device_type?.name || "Unknown"}</Badge>
      ),
      sortable: false,
    },
    {
      key: "created_at",
      header: "Created",
      render: (problem) => {
        const d = new Date(problem.created_at)
        return <span className="text-sm text-muted-foreground">{d.toLocaleDateString()}</span>
      },
      sortable: true,
    },
  ]

  const handleDelete = async (problem: Problem) => {
    if (confirm("Are you sure you want to delete this problem? This action cannot be undone.")) {
      try {
        await deleteProblem(problem.id)
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

          <TableList<Problem>
            title="All Problems"
            description="View and manage all device problems and issues that customers report"
            data={problems}
            columns={columns}
            loading={loading}
            emptyMessage="No problems found in the system"
            searchableFields={["name", "description"]}
            onEdit={(problem) => router.push(`/receptionist/problem/${problem.id}/edit`)}
            onDelete={handleDelete}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
