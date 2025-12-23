"use client";
import { TechnicianSidebar } from "@/components/sidebar/technician"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useDeviceList } from "@/hooks/useDeviceList"

export default function TechnicianDevicesPage() {
  const { data, loading, error } = useDeviceList(50, 0)
  return (
    <SidebarProvider>
      <TechnicianSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Devices</h2>
          </div>
          <Separator className="my-4" />
          {loading && <p>Loading devices...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.map((d) => (
                <div key={d.id} className="rounded-lg border p-4 bg-card shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Device #{d.id}
                    </span>
                  </div>
                  <div className="mt-2 text-sm">
                    <p>Type: {d.device_type_id}</p>
                    <p>Brand: {d.brand_id}</p>
                    <p>Model: {d.model_id}</p>
                    <p>Serial: {d.serial_number ?? "N/A"}</p>
                  </div>
                </div>
              ))}
              {data.length === 0 && <p>No devices found</p>}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
