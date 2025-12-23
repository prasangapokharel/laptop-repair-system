"use client"

import { ReceptionistSidebar } from "@/components/sidebar/receptionist"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useDeviceList } from "@/hooks/useDeviceList"
import { useDeviceBrands } from "@/hooks/useDeviceBrands"
import { useDeviceModels } from "@/hooks/useDeviceModels"
import { useDeviceTypes } from "@/hooks/useDeviceTypes"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function ReceptionistDevicesPage() {
  const [page, setPage] = useState(1)
  const limit = 10
  const offset = (page - 1) * limit

  const { data, loading, error } = useDeviceList(limit, offset)
  const { data: brands } = useDeviceBrands()
  const { data: models } = useDeviceModels()
  const { data: types } = useDeviceTypes()

  const brandMap = Object.fromEntries(brands.map((b) => [b.id, b.name]))
  const modelMap = Object.fromEntries(models.map((m) => [m.id, m.name]))
  const typeMap = Object.fromEntries(types.map((t) => [t.id, t.name]))

  // We don't have total count from useDeviceList yet, so simple pagination
  // Or we assume next page exists if data.length === limit
  const hasMore = data.length === limit

  return (
    <SidebarProvider>
      <ReceptionistSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Devices</h2>
            {/* Receptionist might not need to add devices directly if it's done during order creation, 
                but keeping it consistent with other pages */}
            {/* <Button asChild>
              <Link href="/receptionist/devices/add">Add Device</Link>
            </Button> */}
          </div>
          <Separator className="my-4" />
          {loading && data.length === 0 && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!error && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">All Devices</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Type</TableHead>
                      {/* <TableHead>Actions</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((device) => (
                      <TableRow key={device.id}>
                        <TableCell>#{device.id}</TableCell>
                        <TableCell>{device.serial_number || "-"}</TableCell>
                        <TableCell>{brandMap[device.brand_id] || device.brand_id}</TableCell>
                        <TableCell>{modelMap[device.model_id] || device.model_id}</TableCell>
                        <TableCell>{typeMap[device.device_type_id] || device.device_type_id}</TableCell>
                        {/* <TableCell>
                           <Button variant="outline" size="sm" asChild>
                            <Link href={`/receptionist/devices/${device.id}/edit`}>Edit</Link>
                          </Button> 
                        </TableCell> */}
                      </TableRow>
                    ))}
                    {data.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No devices found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                
                <div className="mt-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    href="#" 
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (page > 1) setPage(page - 1)
                                    }}
                                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                            
                            <PaginationItem>
                                <PaginationLink href="#" isActive>{page}</PaginationLink>
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationNext 
                                    href="#" 
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (hasMore) setPage(page + 1)
                                    }}
                                    className={!hasMore ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>

              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
