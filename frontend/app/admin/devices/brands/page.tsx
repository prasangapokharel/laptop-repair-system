"use client"

import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useDeviceBrands, deleteDeviceBrand } from "@/hooks/useDeviceBrands"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { TableList, type ColumnDef } from "@/components/tables/table-list"
import { Package2, Plus } from "lucide-react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Breadcrumb } from "@/components/breadcrumb"

interface BrandDisplay {
  id: number
  name: string
  created_at: string
}

export default function AdminDeviceBrandsPage() {
  const { data, loading, error } = useDeviceBrands()
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteBrandId, setDeleteBrandId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const columns: ColumnDef<BrandDisplay>[] = [
    {
      key: "id",
      header: "ID",
      render: (brand) => <span className="font-semibold text-sm">#{brand.id}</span>,
      sortable: true,
      width: "60px",
    },
    {
      key: "name",
      header: "Brand Name",
      render: (brand) => <span className="font-medium">{brand.name}</span>,
      sortable: true,
    },
    {
      key: "created_at",
      header: "Created",
      render: (brand) => (
        <span className="text-sm text-muted-foreground">
          {new Date(brand.created_at).toLocaleDateString()}
        </span>
      ),
      sortable: true,
    },
  ]

  const handleDeleteBrand = (brand: BrandDisplay) => {
    setDeleteBrandId(brand.id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteBrandId) return
    setDeleteLoading(true)
    try {
      await deleteDeviceBrand(deleteBrandId)
      setDeleteDialogOpen(false)
      setDeleteBrandId(null)
      router.refresh()
    } catch (err) {
      console.error("Failed to delete brand:", err)
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
              { label: "Brands" },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Package2 className="h-8 w-8" />
                Device Brands
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage device manufacturers and brands
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/admin/devices/brands/add">
                <Plus className="h-4 w-4" />
                Add Brand
              </Link>
            </Button>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
              <p className="text-sm text-destructive">Error: {error}</p>
            </div>
          )}

          <TableList<BrandDisplay>
            title="All Brands"
            description={`Total: ${data.length} device brands`}
            data={data}
            columns={columns}
            loading={loading}
            emptyMessage="No brands found in the system"
            searchableFields={["name"]}
            onEdit={(brand) => router.push(`/admin/devices/brands/${brand.id}/edit`)}
            onDelete={handleDeleteBrand}
          />
        </div>
      </SidebarInset>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Brand"
        description={`Are you sure you want to delete this brand? This action cannot be undone.`}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </SidebarProvider>
  )
}
