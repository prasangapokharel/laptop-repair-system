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
    { title: "Dashboard", url: "/customer/dashboard", icon: IconDashboard },
    { title: "Orders", url: "/customer/orders", icon: IconClipboardList },
    { title: "Devices", url: "/customer/devices", icon: IconDevices },
  ],
  documents: [],
  navSecondary: [
    { title: "Settings", url: "/settings", icon: IconSettings },
    { title: "Help", url: "/help", icon: IconHelp },
  ],
}

export function CustomerSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const avatar = user?.profile_picture || "/avtar.jpg"
  const displayName = user?.full_name || "Customer"
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
              <Link href="/customer/dashboard">
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
