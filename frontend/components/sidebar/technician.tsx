"use client"

import * as React from "react"
import {
  IconDashboard,
  IconClipboardList,
  IconDevices,
  IconSettings,
  IconHelp,
  IconInnerShadowTop,
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
    { title: "Dashboard", url: "/technician/dashboard", icon: IconDashboard },
    { title: "Orders", url: "/technician/orders", icon: IconClipboardList },
    {
      title: "Devices",
      url: "/technician/devices",
      icon: IconDevices,
      items: [
        { title: "View Devices", url: "/technician/devices" },
        { title: "Device Types", url: "/technician/devices/types" },
        { title: "Brands", url: "/technician/devices/brands" },
        { title: "Models", url: "/technician/devices/models" },
        { title: "Problems", url: "/technician/devices/problems" },
      ],
    },
  ],
  documents: [],
  navSecondary: [
    { title: "Settings", url: "/settings", icon: IconSettings },
    { title: "Help", url: "/help", icon: IconHelp },
  ],
}

export function TechnicianSidebar({
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
              <Link href="/technician/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Technicial</span>
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
