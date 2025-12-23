"use client"

import * as React from "react"
import {
  IconDashboard,
  IconUsers,
  IconDevices,
  IconClipboardList,
  IconCash,
  IconSettings,
  IconHelp,
  IconDatabase,
  IconInnerShadowTop,
  IconListDetails,
  IconCategory,
  IconBrandAppgallery,
  IconDeviceMobile,
  IconAlertTriangle,
} from "@tabler/icons-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavDocuments } from "@/components/nav-documents"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"

const data = {
  navMain: [
    { title: "Dashboard", url: "/admin/dashboard", icon: IconDashboard },
    { title: "Users", url: "/admin/users", icon: IconUsers },
    { title: "Devices", url: "/admin/devices", icon: IconDevices },
    { title: "Problems", url: "/admin/problem", icon: IconAlertTriangle },
    { title: "Orders", url: "/admin/orders", icon: IconClipboardList },
    { title: "Payments", url: "/admin/payments", icon: IconCash },
  ],
  documents: [
    { name: "Types", url: "/admin/devices/types", icon: IconCategory },
    { name: "Brands", url: "/admin/devices/brands", icon: IconBrandAppgallery },
    { name: "Models", url: "/admin/devices/models", icon: IconDeviceMobile },
    { name: "Data", url: "/admin/data", icon: IconDatabase },
    { name: "Roles", url: "/admin/roles", icon: IconListDetails },
  ],
  navSecondary: [
    { title: "Settings", url: "/settings", icon: IconSettings },
    { title: "Help", url: "/help", icon: IconHelp },
  ],
}

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const avatar = user?.profile_picture || "/avtar.jpg"
  const displayName = user?.full_name || "User"
  const email = user?.email || ""

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/admin/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">{displayName}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {data.documents.length > 0 && <NavDocuments items={data.documents} />}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: displayName, email, avatar }} />
      </SidebarFooter>
    </Sidebar>
  )
}
