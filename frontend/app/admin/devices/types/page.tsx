"use client"

import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useDeviceTypes, deleteDeviceType } from "@/hooks/useDeviceTypes"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { TableList, type ColumnDef } from "@/components/tables/table-list"
import { Layers, Plus } from "lucide-react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Breadcrumb } from "@/components/breadcrumb"

interface DeviceTypeDisplay {
  id: number
  name: string
  description: string
  created_at: string
}

export default function AdminDeviceTypesPage() {
  const { data, loading, error } = useDeviceTypes()
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTypeId, setDeleteTypeId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const columns: ColumnDef<DeviceTypeDisplay>[] = [
    {
      key: "id",
      header: "ID",
      render: (type) => <span className="font-semibold text-sm">#{type.id}</span>,
      sortable: true,
      width: "60px",
    },
    {
      key: "name",
      header: "Type Name",
      render: (type) => <span className="font-medium">{type.name}</span>,
      sortable: true,
    },
    {
      key: "description",
      header: "Description",
      render: (type) => (
        <span className="text-sm text-muted-foreground">{type.description || "—"}</span>
      ),
      sortable: false,
    },
    {
      key: "created_at",
      header: "Created",
      render: (type) => (
        <span className="text-sm text-muted-foreground">
          {new Date(type.created_at).toLocaleDateString()}
        </span>
      ),
      sortable: true,
    },
  ]

  const handleDeleteType = (type: DeviceTypeDisplay) => {
    setDeleteTypeId(type.id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTypeId) return
    setDeleteLoading(true)
    try {
      await deleteDeviceType(deleteTypeId)
      setDeleteDialogOpen(false)
      setDeleteTypeId(null)
      router.refresh()
    } catch (err) {
      console.error("Failed to delete type:", err)
    } finally {
      setDeleteLoading(false)
    }
  }

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
              { label: "Devices", href: "/admin/devices" },
              { label: "Types" },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Layers className="h-8 w-8" />
                Device Types
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage device categories (Laptop, Desktop, Tablet, etc.)
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/admin/devices/types/add">
                <Plus className="h-4 w-4" />
                Add Type
              </Link>
            </Button>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
              <p className="text-sm text-destructive">Error: {error}</p>
            </div>
          )}

          <TableList<DeviceTypeDisplay>
            title="All Device Types"
            description={`Total: ${data.length} device types`}
            data={data}
            columns={columns}
            loading={loading}
            emptyMessage="No device types found in the system"
            searchableFields={["name", "description"]}
            onEdit={(type) => router.push(`/admin/devices/types/${type.id}/edit`)}
            onDelete={handleDeleteType}
          />
        </div>
      </SidebarInset>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Device Type"
        description={`Are you sure you want to delete this device type? This action cannot be undone.`}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </SidebarProvider>
  )
}
