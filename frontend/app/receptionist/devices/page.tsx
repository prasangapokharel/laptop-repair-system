"use client"

import { ReceptionistSidebar } from "@/components/sidebar/receptionist"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TableList, type ColumnDef } from "@/components/tables/table-list"
import { useDeviceList } from "@/hooks/useDeviceList"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Eye, Smartphone } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"

interface Device {
  id: number
  serial_number: string | null
  device_type?: { id: number; name: string }
  brand?: { id: number; name: string }
  model?: { id: number; name: string }
}

export default function ReceptionistDevicesPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const limit = 12
  const offset = (page - 1) * limit

  const { data: devices, total, loading, error } = useDeviceList(limit, offset)

  const columns: ColumnDef<Device>[] = [
    {
      key: "id",
      header: "Device ID",
      render: (device) => <span className="font-semibold text-sm">#{device.id}</span>,
      sortable: true,
    },
    {
      key: "serial_number",
      header: "Serial Number",
      render: (device) => (
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{device.serial_number || "N/A"}</span>
      ),
      sortable: true,
    },
    {
      key: "device_type",
      header: "Type",
      render: (device) => (
        <Badge variant="outline" className="flex w-fit">{device.device_type?.name || "Unknown"}</Badge>
      ),
      sortable: false,
    },
    {
      key: "brand",
      header: "Brand",
      render: (device) => <span className="font-semibold text-sm">{device.brand?.name || "N/A"}</span>,
      sortable: true,
    },
     {
       key: "model",
       header: "Model",
       render: (device) => <span className="text-sm">{device.model?.name || "N/A"}</span>,
       sortable: true,
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

          <TableList<Device>
            title="All Devices"
            description="Browse through all registered devices with their types, brands, models, and specifications"
            data={devices}
            columns={columns}
            loading={loading}
            emptyMessage="No devices found in the system"
            searchableFields={["serial_number"]}
            onView={(device) => router.push(`/receptionist/devices/${device.id}`)}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
