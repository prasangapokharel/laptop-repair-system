"use client"
import { TechnicianSidebar } from "@/components/sidebar/technician"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useDeviceBrands } from "@/hooks/useDeviceBrands"
import { TableList } from "@/components/tables/table-list"
import type { ColumnDef } from "@/components/tables/table-list"
import { useRouter } from "next/navigation"
import { apiJson } from "@/lib/api"
import { Plus } from "lucide-react"

interface DeviceBrand {
  id: number
  name: string
}

export default function TechnicianDeviceBrandsPage() {
  const { data: brands = [], isLoading } = useDeviceBrands()
  const router = useRouter()

  const columns: ColumnDef<DeviceBrand>[] = [
    {
      key: "id",
      header: "ID",
      width: "80px",
    },
    {
      key: "name",
      header: "Brand Name",
    },
  ]

  async function handleDelete(item: DeviceBrand) {
    if (!confirm(`Are you sure you want to delete brand "${item.name}"?`)) return

    try {
      await apiJson(`/devices/brands/${item.id}`, {
        method: "DELETE",
      })
      window.location.reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete brand")
    }
  }

  function handleEdit(item: DeviceBrand) {
    router.push(`/technician/devices/brands/${item.id}/edit`)
  }

  return (
    <SidebarProvider>
      <TechnicianSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Device Brands</h1>
              <p className="text-muted-foreground">Manage device brands</p>
            </div>
            <Button onClick={() => router.push("/technician/devices/brands/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Brand
            </Button>
          </div>

          <TableList
            data={brands}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchableFields={["name"]}
            loading={isLoading}
            emptyMessage="No brands found. Create one to get started."
            itemsPerPage={15}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
