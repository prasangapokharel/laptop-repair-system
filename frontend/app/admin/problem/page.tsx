"use client"

import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useProblems, deleteProblem } from "@/hooks/useProblems"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { TableList, type ColumnDef } from "@/components/tables/table-list"
import { AlertCircle, Plus } from "lucide-react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Breadcrumb } from "@/components/breadcrumb"

interface ProblemDisplay {
  id: number
  name: string
  description: string | null
  device_type_name: string
  created_at: string
}

export default function AdminProblemsPage() {
  const [page, setPage] = useState(1)
  const limit = 15
  const offset = (page - 1) * limit

  const { data, total, loading, error } = useProblems(limit, offset)
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteProblemId, setDeleteProblemId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const displayData = data.map((problem) => ({
    id: problem.id,
    name: problem.name,
    description: problem.description,
    device_type_name: problem.device_type?.name || "—",
    created_at: problem.created_at,
  }))

  const columns: ColumnDef<ProblemDisplay>[] = [
    {
      key: "id",
      header: "ID",
      render: (problem) => <span className="font-semibold text-sm">#{problem.id}</span>,
      sortable: true,
      width: "60px",
    },
    {
      key: "name",
      header: "Problem Name",
      render: (problem) => <span className="font-medium">{problem.name}</span>,
      sortable: true,
    },
    {
      key: "description",
      header: "Description",
      render: (problem) => (
        <span className="text-sm text-muted-foreground">{problem.description || "—"}</span>
      ),
      sortable: false,
    },
    {
      key: "device_type_name",
      header: "Device Type",
      render: (problem) => <span className="text-sm">{problem.device_type_name}</span>,
      sortable: true,
    },
    {
      key: "created_at",
      header: "Created",
      render: (problem) => (
        <span className="text-sm text-muted-foreground">
          {new Date(problem.created_at).toLocaleDateString()}
        </span>
      ),
      sortable: true,
    },
  ]

  const handleDeleteProblem = (problem: ProblemDisplay) => {
    setDeleteProblemId(problem.id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteProblemId) return
    setDeleteLoading(true)
    try {
      await deleteProblem(deleteProblemId)
      setDeleteDialogOpen(false)
      setDeleteProblemId(null)
      router.refresh()
    } catch (err) {
      console.error("Failed to delete problem:", err)
    } finally {
      setDeleteLoading(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

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
              { label: "Problems" },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <AlertCircle className="h-8 w-8" />
                Device Problems
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage all device issues and problems
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/admin/problem/add">
                <Plus className="h-4 w-4" />
                Add Problem
              </Link>
            </Button>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
              <p className="text-sm text-destructive">Error: {error}</p>
            </div>
          )}

          <TableList<ProblemDisplay>
            title="All Problems"
            description={`Showing ${displayData.length} of ${total} total problems`}
            data={displayData}
            columns={columns}
            loading={loading}
            emptyMessage="No problems found in the system"
            searchableFields={["name", "description"]}
            onEdit={(problem) => router.push(`/admin/problem/${problem.id}/edit`)}
            onDelete={handleDeleteProblem}
            itemsPerPage={limit}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(Math.max(1, page - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Problem"
        description={`Are you sure you want to delete this problem? This action cannot be undone.`}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </SidebarProvider>
  )
}
