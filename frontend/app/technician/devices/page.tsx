"use client";
import { TechnicianSidebar } from "@/components/sidebar/technician";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useDeviceList, type Device } from "@/hooks/useDeviceList";
import { useRouter } from "next/navigation";
import { TableList, ColumnDef } from "@/components/tables/table-list";

export default function TechnicianDevicesPage() {
  const { data, loading } = useDeviceList(15, 0);
  const router = useRouter();

  const columns: ColumnDef<Device>[] = [
    {
      key: "id",
      header: "Device ID",
      render: (device) => `#${device.id}`,
      sortable: true,
    },
    {
      key: "serial_number",
      header: "Serial Number",
      render: (device) => device.serial_number ?? "N/A",
      sortable: true,
    },
    {
      key: "device_type_id",
      header: "Type ID",
      render: (device) => `#${device.device_type_id}`,
      sortable: true,
    },
    {
      key: "brand_id",
      header: "Brand ID",
      render: (device) => `#${device.brand_id}`,
      sortable: true,
    },
    {
      key: "model_id",
      header: "Model ID",
      render: (device) => `#${device.model_id}`,
      sortable: true,
    },
  ];

  return (
    <SidebarProvider>
      <TechnicianSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Devices</h1>
            <p className="text-sm text-muted-foreground">
              View and manage service devices
            </p>
          </div>

          <TableList<Device>
            title="Device List"
            description="Browse all devices available for service"
            data={data}
            columns={columns}
            loading={loading}
            emptyMessage="No devices found"
            searchableFields={["serial_number", "brand_id", "model_id"]}
            onView={(device) =>
              router.push(`/technician/devices/${device.id}`)
            }
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
