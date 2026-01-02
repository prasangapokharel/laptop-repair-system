"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export function AuthGuard({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === "/auth/login") return
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    const userStr = localStorage.getItem("user")
    if (userStr && allowedRoles) {
      try {
        const user = JSON.parse(userStr)
        const userRole = user.role?.name?.toLowerCase()
        const isAllowed = allowedRoles.some((r) => r.toLowerCase() === userRole)
        if (!isAllowed) {
        }
      } catch {}
    }
  }, [router, pathname, allowedRoles])

  return <>{children}</>
}
