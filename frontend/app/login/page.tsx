"use client";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const { login, loading, error } = useAuth()
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  function routeForRole(roleName?: string | null) {
    const name = (roleName || "").toLowerCase()
    if (name === "admin") return "/admin/dashboard"
    if (name === "technician") return "/technician/dashboard"
    if (name === "receptionist" || name === "reception")
      return "/receptionist/dashboard"
    if (name === "accountant") return "/accountant/dashboard"
    return "/dashboard"
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const user = await login(phone, password)
      router.push(routeForRole(user.role?.name))
    } catch {}
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-xl">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold">Sign in</h1>
                <p className="text-muted-foreground">
                  Use your phone and password
                </p>
              </div>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="phone">Phone</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Field>
                {error && (
                  <p className="text-sm text-red-500" role="alert">
                    {error}
                  </p>
                )}
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Signing in..." : "Login"}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
