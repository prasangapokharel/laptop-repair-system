"use client";
import { CustomerSidebar } from "@/components/sidebar/customer"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { useUserMutations } from "@/hooks/useUserMutations"
import { useState } from "react"

export default function CustomerChangePasswordPage() {
  const { user } = useAuth()
  const id = user?.id ? Number(user.id) : 0
  const { changePassword, loading, error } = useUserMutations()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [success, setSuccess] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!id || !password || password !== confirm) return
    await changePassword(id, password)
    setSuccess(true)
    setPassword("")
    setConfirm("")
  }

  return (
    <SidebarProvider>
      <CustomerSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <Card>
            <CardContent className="p-6">
              <form onSubmit={onSubmit} className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>New Password</FieldLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Confirm Password</FieldLabel>
                    <Input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                    />
                  </Field>
                  {error && (
                    <p className="text-sm text-red-500" role="alert">
                      {error}
                    </p>
                  )}
                  {success && (
                    <p className="text-sm text-green-600">Password changed.</p>
                  )}
                  <Button type="submit" disabled={loading}>
                    {loading ? "Changing..." : "Change Password"}
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
