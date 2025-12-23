"use client"
import { AuthGuard } from "@/components/auth-guard"

export default function ReceptionistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard allowedRoles={["receptionist", "reception"]}>
      {children}
    </AuthGuard>
  )
}
