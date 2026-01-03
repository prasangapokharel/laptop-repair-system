"use client"
import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDeviceList } from "@/hooks/useDeviceList"
import { useState } from "react"
import { TableList, type ColumnDef } from "@/components/tables/table-list"
import { Edit, Trash2, Plus, IconDevices } from "lucide-react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Breadcrumb } from "@/components/breadcrumb"
import { apiJson } from "@/lib/api"

interface DeviceDisplay {
  id: number
  brand: string
  model: string
  type: string
  serial_number: string | null
  owner_id: number | null
  notes: string | null
}

export default function AdminDevicesListPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const limit = 15
  const offset = (page - 1) * limit

  const { data, total, loading, error, refetch } = useDeviceList(limit, offset)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteDeviceId, setDeleteDeviceId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const displayData = data.map((device) => ({
    id: device.id,
    brand: device.brand?.name || "—",
    model: device.model?.name || "—",
    type: device.device_type?.name || "—",
    serial_number: device.serial_number || "—",
    owner_id: device.owner_id || null,
    notes: device.notes || "—",
  }))

  async function handleDelete(id: number) {
    setDeleteLoading(true)
    try {
      await apiJson(`/devices/${id}`, { method: "DELETE" })
      refetch()
      setDeleteDialogOpen(false)
    } catch (err) {
      console.error("Failed to delete device:", err)
    } finally {
      setDeleteLoading(false)
    }
  }

  const columns: ColumnDef<DeviceDisplay>[] = [
    {
      key: "id",
      header: "ID",
      render: (device) => <span className="font-semibold">#{device.id}</span>,
      sortable: true,
    },
    {
      key: "brand",
      header: "Brand",
      render: (device) => <span>{device.brand}</span>,
      sortable: true,
    },
    {
      key: "model",
      header: "Model",
      render: (device) => <span>{device.model}</span>,
      sortable: true,
    },
    {
      key: "type",
      header: "Type",
      render: (device) => <span>{device.type}</span>,
      sortable: true,
    },
    {
      key: "serial_number",
      header: "Serial Number",
      render: (device) => <span className="font-mono text-sm">{device.serial_number}</span>,
      sortable: true,
    },
    {
      key: "notes",
      header: "Notes",
      render: (device) => <span className="text-sm truncate max-w-[200px]">{device.notes}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (device) => (
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/admin/devices/${device.id}/edit`)}
            className="p-1.5 hover:bg-accent rounded-md"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setDeleteDeviceId(device.id)
              setDeleteDialogOpen(true)
            }}
            className="p-1.5 hover:bg-accent rounded-md text-destructive"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  const totalPages = Math.ceil(total / limit)

  const breadcrumbItems = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Devices", href: "/admin/devices" },
    { label: "All Devices", href: "/admin/devices/list" },
  ]

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconDevices className="h-6 w-6" />
              <h1 className="text-2xl font-bold">All Devices</h1>
            </div>
            <Button asChild>
              <Link href="/admin/devices/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Device
              </Link>
            </Button>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          <TableList
            data={displayData}
            columns={columns}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            loading={loading}
            emptyMessage="No devices found"
          />

          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={() => deleteDeviceId && handleDelete(deleteDeviceId)}
            loading={deleteLoading}
            title="Delete Device"
            description="Are you sure you want to delete this device? This action cannot be undone."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
