"use client";

import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDevicesHubPage() {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Device Management</h2>
          </div>
          <Separator className="my-4" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
                <CardDescription>Manage categories like Laptop, Desktop, Tablet.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href="/admin/devices/types">Open</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/admin/devices/types/add">Add Type</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Brands</CardTitle>
                <CardDescription>Manage manufacturers such as Dell, Apple, HP.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href="/admin/devices/brands">Open</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/admin/devices/brands/add">Add Brand</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Models</CardTitle>
                <CardDescription>Manage device models for each brand and type.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href="/admin/devices/models">Open</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/admin/devices/models/add">Add Model</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Devices</CardTitle>
                <CardDescription>Manage individual device records in the system.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href="/admin/devices/list">View All</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/admin/devices/add">Add Device</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
