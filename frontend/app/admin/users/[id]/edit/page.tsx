"use client";
import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useUserDetail } from "@/hooks/useUserDetail"
import { useUserMutations } from "@/hooks/useUserMutations"
import { useRoles } from "@/hooks/useRoles"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

export default function AdminEditUserPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const { data } = useUserDetail(id)
  const { updateUser, assignRole, loading, error } = useUserMutations()
  const { data: roles } = useRoles()
  const router = useRouter()

  const [fullName, setFullName] = useState<string | null>(null)
  const [phone, setPhone] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [isStaff, setIsStaff] = useState<boolean | null>(null)
  const [isActive, setIsActive] = useState<boolean | null>(null)
  const [roleId, setRoleId] = useState<number | null>(null)

  const fullNameVal = fullName ?? data?.full_name ?? ""
  const phoneVal = phone ?? data?.phone ?? ""
  const emailVal = email ?? data?.email ?? ""
  const isStaffVal = isStaff ?? data?.is_staff ?? false
  const isActiveVal = isActive ?? data?.is_active ?? true

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updateUser(id, {
        full_name: fullNameVal,
        phone: phoneVal,
        email: emailVal || undefined,
        is_staff: isStaffVal,
        is_active: isActiveVal,
      })
      if (roleId) {
        await assignRole(id, roleId)
      }
      router.push("/admin/users")
    } catch {}
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold mb-4">Edit User #{id}</h2>
          <Card>
            <CardContent className="p-6">
              <form onSubmit={onSubmit} className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Full Name</FieldLabel>
                    <Input
                      type="text"
                      value={fullNameVal}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Role</FieldLabel>
                    <Select onValueChange={(v) => setRoleId(Number(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((r) => (
                          <SelectItem key={r.id} value={String(r.id)}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Phone</FieldLabel>
                    <Input
                      type="text"
                      value={phoneVal}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      type="email"
                      value={emailVal || ""}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Staff</FieldLabel>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={isStaffVal}
                        onCheckedChange={(v) => setIsStaff(Boolean(v))}
                      />
                      <span className="text-sm">Is staff</span>
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel>Active</FieldLabel>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={isActiveVal}
                        onCheckedChange={(v) => setIsActive(Boolean(v))}
                      />
                      <span className="text-sm">Is active</span>
                    </div>
                  </Field>
                  {error && (
                    <p className="text-sm text-red-500" role="alert">
                      {error}
                    </p>
                  )}
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
