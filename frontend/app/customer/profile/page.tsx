"use client";
import { CustomerSidebar } from "@/components/sidebar/customer"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { useUserDetail } from "@/hooks/useUserDetail"
import { useUserMutations } from "@/hooks/useUserMutations"
import { useState } from "react"
import Image from "next/image"
import { uploadProfileImage } from "@/hooks/useUpload"

export default function CustomerProfilePage() {
  const { user } = useAuth()
  const id = user?.id ? Number(user.id) : 0
  const { data } = useUserDetail(id)
  const { updateUser, loading, error } = useUserMutations()

  const [fullName, setFullName] = useState<string | null>(null)
  const [phone, setPhone] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [profilePath, setProfilePath] = useState<string | null>(null)
  const fullNameVal = fullName ?? data?.full_name ?? ""
  const phoneVal = phone ?? data?.phone ?? ""
  const emailVal = email ?? data?.email ?? ""
  const profilePicVal = profilePicture ?? profilePath ?? data?.profile_picture ?? ""

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
    if (!id) return
    let imagePath = profilePath
    if (file && !imagePath) {
      imagePath = await uploadProfileImage(fullNameVal, file)
      setProfilePath(imagePath)
    }
    await updateUser(id, {
      full_name: fullNameVal,
      phone: phoneVal,
      email: emailVal,
      profile_picture: imagePath ?? profilePicVal ?? null,
    })
  }

  return (
    <SidebarProvider>
      <CustomerSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold mb-4">My Profile</h2>
          <Card>
            <CardContent className="p-6">
              <form onSubmit={onSubmit} className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Full Name</FieldLabel>
                    <Input
                      value={fullNameVal}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Phone</FieldLabel>
                    <Input value={phoneVal} onChange={(e) => setPhone(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input value={emailVal} onChange={(e) => setEmail(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel>Profile Picture URL</FieldLabel>
                    <Input
                      value={profilePicVal}
                      onChange={(e) => setProfilePicture(e.target.value)}
                      placeholder="https://..."
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Upload Profile Image</FieldLabel>
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
                              const p = await uploadProfileImage(fullNameVal, file)
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
                            alt="Selected preview"
                            fill
                            className="object-cover"
                          />
                        ) : profilePicVal ? (
                          <Image
                            src={profilePicVal}
                            alt="Profile image"
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
                  </Field>
                  {error && (
                    <p className="text-sm text-red-500" role="alert">
                      {error}
                    </p>
                  )}
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Profile"}
                  </Button>
                </FieldGroup>
              </form>
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <a href="/customer/profile/password">Change Password</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
