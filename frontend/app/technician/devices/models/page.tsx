"use client"
import { TechnicianSidebar } from "@/components/sidebar/technician"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useDeviceModels } from "@/hooks/useDeviceModels"
import { useDeviceBrands } from "@/hooks/useDeviceBrands"
import { useDeviceTypes } from "@/hooks/useDeviceTypes"
import { TableList } from "@/components/tables/table-list"
import type { ColumnDef } from "@/components/tables/table-list"
import { useRouter } from "next/navigation"
import { apiJson } from "@/lib/api"
import { Plus } from "lucide-react"

interface DeviceModel {
  id: number
  name: string
  brand_id: number
  device_type_id: number
}

export default function TechnicianDeviceModelsPage() {
  const { data: models = [], isLoading } = useDeviceModels()
  const { data: brands = [] } = useDeviceBrands()
  const { data: types = [] } = useDeviceTypes()
  const router = useRouter()

  const columns: ColumnDef<DeviceModel>[] = [
    {
      key: "id",
      header: "ID",
      width: "80px",
    },
    {
      key: "name",
      header: "Model Name",
    },
    {
      key: "brand_id",
      header: "Brand",
      render: (item) => {
        const brand = brands.find((b) => b.id === item.brand_id)
        return brand?.name || `ID: ${item.brand_id}`
      },
    },
    {
      key: "device_type_id",
      header: "Device Type",
      render: (item) => {
        const type = types.find((t) => t.id === item.device_type_id)
        return type?.name || `ID: ${item.device_type_id}`
      },
    },
  ]

  async function handleDelete(item: DeviceModel) {
    if (!confirm(`Are you sure you want to delete model "${item.name}"?`)) return

    try {
      await apiJson(`/devices/models/${item.id}`, {
        method: "DELETE",
      })
      window.location.reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete model")
    }
  }

  function handleEdit(item: DeviceModel) {
    router.push(`/technician/devices/models/${item.id}/edit`)
  }

  return (
    <SidebarProvider>
      <TechnicianSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Device Models</h1>
              <p className="text-muted-foreground">Manage device models</p>
            </div>
            <Button onClick={() => router.push("/technician/devices/models/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Model
            </Button>
          </div>

          <TableList
            data={models}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchableFields={["name"]}
            loading={isLoading}
            emptyMessage="No models found. Create one to get started."
            itemsPerPage={15}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
