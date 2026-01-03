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
import { toast } from "sonner"

export default function AdminAddUserPage() {
  const { createUser, assignRole, loading, error } = useUserMutations()
  const router = useRouter()
  const { data: roles = [] } = useRoles()
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
        toast.loading("Uploading profile image...")
        imagePath = await uploadProfileImage(fullName, file)
        setProfilePath(imagePath)
        toast.dismiss()
      }
      toast.loading("Creating user...")
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
      toast.dismiss()
      toast.success("User created successfully!")
      router.push("/admin/users")
    } catch (err: any) {
      toast.dismiss()
      toast.error(err.message || "Failed to create user")
    }
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
          <div className="w-full max-w-4xl mx-auto">
            <Card>
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
                      <div className="flex flex-col gap-2 flex-1">
                        <Input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={(e) =>
                            onFileSelected(e.target.files?.[0] || null)
                          }
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            if (!file) {
                              toast.error("Please select an image first")
                              return
                            }
                            if (!fullName.trim()) {
                              toast.error("Please enter full name first")
                              return
                            }
                            try {
                              toast.loading("Uploading to Cloudinary...")
                              const cloudinaryUrl = await uploadProfileImage(fullName, file)
                              setProfilePath(cloudinaryUrl)
                              toast.dismiss()
                              toast.success("Image uploaded successfully!")
                            } catch (err: any) {
                              toast.dismiss()
                              toast.error(err.message || "Failed to upload image")
                            }
                          }}
                          disabled={!file || !fullName.trim()}
                        >
                          Upload to Cloud
                        </Button>
                        {profilePath && (
                          <div className="space-y-1">
                            <span className="text-xs font-medium text-green-600">✓ Uploaded to CDN</span>
                            <p className="text-xs text-muted-foreground break-all">
                              {profilePath}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="relative h-20 w-20 overflow-hidden rounded-lg border flex-shrink-0">
                        {preview || profilePath ? (
                          <Image
                            src={preview || profilePath || ""}
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
                    <p className="text-xs text-muted-foreground">
                      Upload to Cloudinary CDN before creating user. Supported formats: PNG, JPEG, JPG, WebP
                    </p>
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
