"use client";
import { CustomerSidebar } from "@/components/sidebar/customer";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useDeviceList, type Device } from "@/hooks/useDeviceList";
import { useRouter } from "next/navigation";
import { TableList, ColumnDef } from "@/components/tables/table-list";

export default function CustomerDevicesPage() {
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
      header: "Type",
      render: (device) => `Type #${device.device_type_id}`,
      sortable: true,
    },
    {
      key: "brand_id",
      header: "Brand",
      render: (device) => `Brand #${device.brand_id}`,
      sortable: true,
    },
    {
      key: "model_id",
      header: "Model",
      render: (device) => `Model #${device.model_id}`,
      sortable: true,
    },
  ];

  return (
    <SidebarProvider>
      <CustomerSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">My Devices</h1>
            <p className="text-sm text-muted-foreground">
              View your registered devices
            </p>
          </div>

          <TableList<Device>
            title="Device List"
            description="Your registered devices available for service"
            data={data}
            columns={columns}
            loading={loading}
            emptyMessage="No devices found"
            searchableFields={["serial_number", "brand_id", "model_id"]}
            onView={(device) =>
              router.push(`/customer/devices/${device.id}`)
            }
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
