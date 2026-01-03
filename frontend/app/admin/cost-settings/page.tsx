"use client"

import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useCostSettings, deleteCostSetting } from "@/hooks/useCostSettings"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { TableList, type ColumnDef } from "@/components/tables/table-list"
import { DollarSign, Plus } from "lucide-react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Breadcrumb } from "@/components/breadcrumb"
import { toast } from "sonner"

interface CostSettingDisplay {
  id: number
  device_type_name: string
  problem_name: string
  cost: string | number
  description: string | undefined
  created_at: string
}

export default function AdminCostSettingsPage() {
  const { data, loading, error } = useCostSettings()
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteCostId, setDeleteCostId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const displayData = data.map((cost) => ({
    id: cost.id,
    device_type_name: cost.device_type?.name || "—",
    problem_name: cost.problem?.name || "—",
    cost: cost.cost,
    description: cost.description,
    created_at: cost.created_at,
  }))

  const columns: ColumnDef<CostSettingDisplay>[] = [
    {
      key: "id",
      header: "ID",
      render: (cost) => <span className="font-semibold text-sm">#{cost.id}</span>,
      sortable: true,
      width: "60px",
    },
    {
      key: "device_type_name",
      header: "Device Type",
      render: (cost) => <span className="text-sm">{cost.device_type_name}</span>,
      sortable: true,
    },
    {
      key: "problem_name",
      header: "Problem",
      render: (cost) => <span className="text-sm">{cost.problem_name}</span>,
      sortable: true,
    },
    {
      key: "cost",
      header: "Cost",
      render: (cost) => <span className="font-mono font-semibold">रु {cost.cost}</span>,
      sortable: true,
    },
    {
      key: "description",
      header: "Description",
      render: (cost) => (
        <span className="text-sm text-muted-foreground">{cost.description || "—"}</span>
      ),
      sortable: false,
    },
    {
      key: "created_at",
      header: "Created",
      render: (cost) => (
        <span className="text-sm text-muted-foreground">
          {new Date(cost.created_at).toLocaleDateString()}
        </span>
      ),
      sortable: true,
    },
  ]

  const handleDeleteCost = (cost: CostSettingDisplay) => {
    setDeleteCostId(cost.id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteCostId) return
    setDeleteLoading(true)
    toast.loading("Deleting cost setting...")
    try {
      await deleteCostSetting(deleteCostId)
      toast.dismiss()
      toast.success("Cost setting deleted successfully!")
      setDeleteDialogOpen(false)
      setDeleteCostId(null)
      router.refresh()
    } catch (err: any) {
      toast.dismiss()
      toast.error(err.message || "Failed to delete cost setting")
      console.error("Failed to delete cost setting:", err)
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
              { label: "Cost Settings" },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <DollarSign className="h-8 w-8" />
                Cost Settings
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage repair costs for different device problems
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/admin/cost-settings/add">
                <Plus className="h-4 w-4" />
                Add Cost Setting
              </Link>
            </Button>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
              <p className="text-sm text-destructive">Error: {error}</p>
            </div>
          )}

          <TableList<CostSettingDisplay>
            title="All Cost Settings"
            description={`Total: ${data.length} cost settings`}
            data={displayData}
            columns={columns}
            loading={loading}
            emptyMessage="No cost settings found in the system"
            searchableFields={["device_type_name", "problem_name"]}
            onEdit={(cost) => router.push(`/admin/cost-settings/${cost.id}/edit`)}
            onDelete={handleDeleteCost}
          />
        </div>
      </SidebarInset>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Cost Setting"
        description={`Are you sure you want to delete this cost setting? This action cannot be undone.`}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </SidebarProvider>
  )
}
