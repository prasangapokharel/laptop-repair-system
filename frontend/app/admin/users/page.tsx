"use client"

import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useUsers } from "@/hooks/useUsers"
import { useUserMutations } from "@/hooks/useUserMutations"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { TableList, type ColumnDef } from "@/components/tables/table-list"
import { Users, Plus } from "lucide-react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Breadcrumb } from "@/components/breadcrumb"

interface UserDisplay {
  id: number
  full_name: string
  phone: string
  email: string | null
  role_name?: string
  is_active: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const limit = 15
  const offset = (page - 1) * limit

  const { data, total, loading, error } = useUsers(limit, offset)
  const { deleteUser, loading: deleteLoading } = useUserMutations()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null)

  const displayData = data.map((user) => ({
    id: user.id,
    full_name: user.full_name,
    phone: user.phone,
    email: user.email || "—",
    role_name: user.role?.name || "—",
    is_active: user.is_active,
    created_at: user.created_at,
  }))

  const columns: ColumnDef<UserDisplay>[] = [
    {
      key: "id",
      header: "ID",
      render: (user) => <span className="font-semibold text-sm">#{user.id}</span>,
      sortable: true,
      width: "60px",
    },
    {
      key: "full_name",
      header: "Name",
      render: (user) => <span className="font-medium">{user.full_name}</span>,
      sortable: true,
    },
    {
      key: "phone",
      header: "Phone",
      render: (user) => <span className="font-mono text-sm">{user.phone}</span>,
      sortable: true,
    },
    {
      key: "email",
      header: "Email",
      render: (user) => <span className="text-sm">{user.email}</span>,
      sortable: true,
    },
    {
      key: "role_name",
      header: "Role",
      render: (user) => (
        <Badge variant="secondary" className="text-xs">
          {user.role_name}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "is_active",
      header: "Status",
      render: (user) => (
        <Badge variant={user.is_active ? "default" : "destructive"} className="text-xs">
          {user.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "created_at",
      header: "Joined",
      render: (user) => (
        <span className="text-sm text-muted-foreground">
          {new Date(user.created_at).toLocaleDateString()}
        </span>
      ),
      sortable: true,
    },
  ]

  const handleDeleteUser = (user: UserDisplay) => {
    setDeleteUserId(user.id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteUserId) return
    try {
      await deleteUser(deleteUserId)
      setDeleteDialogOpen(false)
      setDeleteUserId(null)
      router.refresh()
    } catch (err) {
      console.error("Failed to delete user:", err)
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
              { label: "Users" },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Users className="h-8 w-8" />
                Users Management
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage all system users, roles, and permissions
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/admin/users/add">
                <Plus className="h-4 w-4" />
                Add User
              </Link>
            </Button>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
              <p className="text-sm text-destructive">Error: {error}</p>
            </div>
          )}

          <TableList<UserDisplay>
            title="All Users"
            description={`Showing ${displayData.length} of ${total} total users`}
            data={displayData}
            columns={columns}
            loading={loading}
            emptyMessage="No users found in the system"
            searchableFields={["full_name", "email", "phone"]}
            onEdit={(user) => router.push(`/admin/users/${user.id}/edit`)}
            onDelete={handleDeleteUser}
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
        title="Delete User"
        description={`Are you sure you want to delete user #${deleteUserId}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </SidebarProvider>
  )
}
