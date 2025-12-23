"use client";
import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useUserMutations } from "@/hooks/useUserMutations"
import { useRoles } from "@/hooks/useRoles"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import { uploadProfileImage } from "@/hooks/useUpload"

export default function AdminAddUserPage() {
  const { createUser, assignRole, loading, error } = useUserMutations()
  const router = useRouter()
  const { data: roles } = useRoles()
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [roleId, setRoleId] = useState<number | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [profilePath, setProfilePath] = useState<string | null>(null)

  function onFileSelected(f: File | null) {
    setFile(f)
    setProfilePath(null)
    if (f) {
      const url = URL.createObjectURL(f)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  async function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f && ["image/png", "image/jpeg"].includes(f.type)) {
      onFileSelected(f)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      let imagePath = profilePath
      if (file && !imagePath) {
        imagePath = await uploadProfileImage(file)
        setProfilePath(imagePath)
      }
      const user = await createUser({
        full_name: fullName,
        phone,
        email,
        password,
        is_staff: false,
        profile_picture: imagePath ?? null,
      })
      if (roleId) {
        await assignRole(user.id, roleId)
      }
      router.push("/admin/users")
    } catch {}
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between space-y-2 py-4">
             <h2 className="text-3xl font-bold tracking-tight">Add User</h2>
          </div>
          <div className="w-full">
            <Card className="w-full">
              <CardContent className="p-6">
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                      <FieldLabel>Full Name</FieldLabel>
                      <Input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
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
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FieldLabel>Phone</FieldLabel>
                      <Input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                         placeholder="+1234567890"
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel>Email</FieldLabel>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Password</FieldLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Profile Image</FieldLabel>
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={onDrop}
                      className="flex items-center gap-4 rounded-lg border border-dashed p-3"
                    >
                      <div className="flex flex-col gap-2">
                        <Input
                          type="file"
                          accept="image/png,image/jpeg"
                          onChange={(e) =>
                            onFileSelected(e.target.files?.[0] || null)
                          }
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            if (file) {
                              const p = await uploadProfileImage(file)
                              setProfilePath(p)
                            }
                          }}
                          disabled={!file}
                        >
                          Upload
                        </Button>
                        {profilePath && (
                          <span className="text-xs text-muted-foreground">
                            {profilePath}
                          </span>
                        )}
                      </div>
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg border">
                        {preview ? (
                          <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {error && (
                    <p className="text-sm text-red-500" role="alert">
                      {error}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create User"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
