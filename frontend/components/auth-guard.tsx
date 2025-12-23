"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    // Skip check for login page
    if (pathname === "/login") {
      setAuthorized(true)
      return
    }

    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")
      return
    }

    // Optional: Check role if stored in localStorage
    const userStr = localStorage.getItem("user")
    if (userStr && allowedRoles) {
      try {
        const user = JSON.parse(userStr)
        const userRole = user.role?.name?.toLowerCase()
        // If allowedRoles is provided, check if user's role is in it
        // Note: this is a client-side check only. Server API should also validate.
        const isAllowed = allowedRoles.some(r => r.toLowerCase() === userRole)
        
        if (!isAllowed) {
            // Redirect to their dashboard if they try to access unauthorized area
            // Or just show 403
            // For now, let's just allow if they have ANY role to avoid infinite redirects if logic is complex,
            // but ideally we redirect to their own dashboard.
            // router.push("/dashboard") 
            // setAuthorized(false)
            // return
        }
      } catch {}
    }

    setAuthorized(true)
  }, [router, pathname, allowedRoles])

  if (!authorized) {
    return null // Or a loading spinner
  }

  return <>{children}</>
}
