"use client"
import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Breadcrumb } from "@/components/breadcrumb"
import { IconListDetails } from "@tabler/icons-react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { apiJson } from "@/lib/api"

interface Role {
  id: number
  name: string
  description?: string | null
}

export default function AdminRoleEditPage() {
  const router = useRouter()
  const params = useParams()
  const roleId = params.id as string
  
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRole() {
      try {
        const role = await apiJson<Role>(`/users/roles/${roleId}`)
        setName(role.name)
        setDescription(role.description || "")
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load role"
        setError(message)
      } finally {
        setFetchLoading(false)
      }
    }
    fetchRole()
  }, [roleId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    
    if (!name.trim()) {
      setError("Role name is required")
      return
    }

    setLoading(true)
    try {
      await apiJson(`/users/roles/${roleId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      })
      router.push("/admin/roles")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update role"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbItems = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Roles", href: "/admin/roles" },
    { label: "Edit Role", href: `/admin/roles/${roleId}/edit` },
  ]

  if (fetchLoading) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">Loading role...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="flex items-center gap-2">
            <IconListDetails className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Edit Role</h1>
          </div>

          <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter role name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter role description"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Role"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
