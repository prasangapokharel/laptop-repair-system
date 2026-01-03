"use client"
import { TechnicianSidebar } from "@/components/sidebar/technician"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useProblems } from "@/hooks/useProblems"
import { useDeviceTypes } from "@/hooks/useDeviceTypes"
import { TableList } from "@/components/tables/table-list"
import type { ColumnDef } from "@/components/tables/table-list"
import { useRouter } from "next/navigation"
import { apiJson } from "@/lib/api"
import { Plus } from "lucide-react"

interface Problem {
  id: number
  name: string
  description?: string
  device_type_id?: number
}

export default function TechnicianProblemsPage() {
  const { data: problems = [], isLoading } = useProblems()
  const { data: types = [] } = useDeviceTypes()
  const router = useRouter()

  const columns: ColumnDef<Problem>[] = [
    {
      key: "id",
      header: "ID",
      width: "80px",
    },
    {
      key: "name",
      header: "Problem Name",
    },
    {
      key: "description",
      header: "Description",
      render: (item) => item.description || "—",
    },
    {
      key: "device_type_id",
      header: "Device Type",
      render: (item) => {
        if (!item.device_type_id) return "—"
        const type = types.find((t) => t.id === item.device_type_id)
        return type?.name || `ID: ${item.device_type_id}`
      },
    },
  ]

  async function handleDelete(item: Problem) {
    if (!confirm(`Are you sure you want to delete problem "${item.name}"?`)) return

    try {
      await apiJson(`/problems/${item.id}`, {
        method: "DELETE",
      })
      window.location.reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete problem")
    }
  }

  function handleEdit(item: Problem) {
    router.push(`/technician/devices/problems/${item.id}/edit`)
  }

  return (
    <SidebarProvider>
      <TechnicianSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Device Problems</h1>
              <p className="text-muted-foreground">Manage device problems for troubleshooting</p>
            </div>
            <Button onClick={() => router.push("/technician/devices/problems/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Problem
            </Button>
          </div>

          <TableList
            data={problems}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchableFields={["name", "description"]}
            loading={isLoading}
            emptyMessage="No problems found. Create one to get started."
            itemsPerPage={15}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
