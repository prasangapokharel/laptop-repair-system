"use client"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function toTitleCase(s: string) {
  return s
    .split(/[-_/]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function SiteHeader({ title }: { title?: string }) {
  const { user, logout } = useAuth()
  const avatar = user?.profile_picture || "/avtar.jpg"
  const displayName = user?.full_name || "User"
  const email = user?.email || ""

  const handleLogout = async () => {
    await logout()
    window.location.href = "/auth/login"
  }

  const computedTitle = useMemo(() => {
    if (title) return title
    // Default to dashboard - title will update via useEffect with router info
    return "Dashboard"
  }, [title])

  const [pageTitle, setPageTitle] = useState("Dashboard")

  useEffect(() => {
    const path = window.location.pathname
    const segments = path.split("/").filter(Boolean)
    const last = segments[segments.length - 1] || "dashboard"
    
    let newTitle = "Dashboard"
    if (last === "dashboard") newTitle = "Dashboard"
    else if (path.includes("/devices/types")) newTitle = "Device Types"
    else if (path.includes("/devices/brands")) newTitle = "Brands"
    else if (path.includes("/devices/models")) newTitle = "Models"
    else newTitle = toTitleCase(last)
    
    setPageTitle(title || newTitle)
  }, [])

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${pageTitle} • Laptop Admin`
    }
  }, [pageTitle])

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 py-6 px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
         <h1 className="text-base font-medium">{pageTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={avatar} alt={displayName} />
                <AvatarFallback className="rounded-lg">U</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-56 rounded-lg" side="bottom" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={avatar} alt={displayName} />
                    <AvatarFallback className="rounded-lg">U</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{displayName}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Account</DropdownMenuItem>
              <DropdownMenuItem>Notifications</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
