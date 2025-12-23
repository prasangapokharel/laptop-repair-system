"use client"
import { AuthGuard } from "@/components/auth-guard"

export default function TechnicianLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard allowedRoles={["technician"]}>
      {children}
    </AuthGuard>
  )
}
