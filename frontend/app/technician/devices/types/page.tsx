"use client"
import { TechnicianSidebar } from "@/components/sidebar/technician"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useDeviceTypes } from "@/hooks/useDeviceTypes"
import { TableList } from "@/components/tables/table-list"
import type { ColumnDef } from "@/components/tables/table-list"
import { useRouter } from "next/navigation"
import { apiJson } from "@/lib/api"
import { Plus } from "lucide-react"

interface DeviceType {
  id: number
  name: string
  description?: string
}

export default function TechnicianDeviceTypesPage() {
  const { data: types = [], isLoading } = useDeviceTypes()
  const router = useRouter()

  const columns: ColumnDef<DeviceType>[] = [
    {
      key: "id",
      header: "ID",
      width: "80px",
    },
    {
      key: "name",
      header: "Device Type Name",
    },
    {
      key: "description",
      header: "Description",
      render: (item) => item.description || "—",
    },
  ]

  async function handleDelete(item: DeviceType) {
    if (!confirm(`Are you sure you want to delete device type "${item.name}"?`)) return

    try {
      await apiJson(`/devices/types/${item.id}`, {
        method: "DELETE",
      })
      window.location.reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete device type")
    }
  }

  function handleEdit(item: DeviceType) {
    router.push(`/technician/devices/types/${item.id}/edit`)
  }

  return (
    <SidebarProvider>
      <TechnicianSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Device Types</h1>
              <p className="text-muted-foreground">Manage device types for your service</p>
            </div>
            <Button onClick={() => router.push("/technician/devices/types/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Device Type
            </Button>
          </div>

          <TableList
            data={types}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchableFields={["name", "description"]}
            loading={isLoading}
            emptyMessage="No device types found. Create one to get started."
            itemsPerPage={15}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
