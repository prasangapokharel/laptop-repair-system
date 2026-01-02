"use client"

import { ReceptionistSidebar } from "@/components/sidebar/receptionist"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TableList } from "@/components/tables/table-list"
import { useDeviceList } from "@/hooks/useDeviceList"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Eye, Smartphone } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"

export default function ReceptionistDevicesPage() {
  const [page, setPage] = useState(1)
  const limit = 12
  const offset = (page - 1) * limit

  const { data: devices, total, loading, error } = useDeviceList(limit, offset)

  const columns = [
    {
      key: "id",
      label: "Device ID",
      render: (id: number) => <span className="font-semibold text-sm">#{id}</span>,
      searchable: true,
    },
    {
      key: "serial_number",
      label: "Serial Number",
      render: (serial: string | null) => (
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{serial || "N/A"}</span>
      ),
      searchable: true,
    },
    {
      key: "device_type",
      label: "Type",
      render: (type: any) => (
        <Badge variant="outline" className="flex w-fit">{type?.name || "Unknown"}</Badge>
      ),
    },
    {
      key: "brand",
      label: "Brand",
      render: (brand: any) => <span className="font-semibold text-sm">{brand?.name || "N/A"}</span>,
      searchable: true,
    },
    {
      key: "model",
      label: "Model",
      render: (model: any) => <span className="text-sm">{model?.name || "N/A"}</span>,
      searchable: true,
    },
    {
      key: "color",
      label: "Color",
      render: (color: string | null) => (
        <span className="text-sm">{color || "N/A"}</span>
      ),
    },
  ]

  return (
    <SidebarProvider>
      <ReceptionistSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 space-y-4 p-4 md:p-6">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/receptionist/dashboard" },
              { label: "Devices" },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Smartphone className="h-8 w-8" />
                Devices
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Manage and view all device inventory in the system</p>
            </div>
          </div>

          <TableList
            title="All Devices"
            description="Browse through all registered devices with their types, brands, models, and specifications"
            data={devices}
            columns={columns}
            isLoading={loading}
            error={error}
            totalCount={total}
            currentPage={page}
            pageSize={limit}
            onPageChange={setPage}
            actions={[
              {
                label: "View Details",
                icon: <Eye className="h-4 w-4" />,
                href: (id) => `/receptionist/devices/${id}`,
              },
            ]}
            emptyMessage="No devices found in the system"
            showSearch={true}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
