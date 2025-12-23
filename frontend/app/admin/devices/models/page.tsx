"use client";
import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useDeviceModels, deleteDeviceModel } from "@/hooks/useDeviceModels"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDeviceModelsPage() {
  const { data, loading, error } = useDeviceModels()
  const router = useRouter()
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Models</h2>
            <Button asChild>
              <Link href="/admin/devices/models/add">Add Model</Link>
            </Button>
          </div>
          <Separator className="my-4" />
          {loading && <p>Loading models...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">All Models</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>#{m.id}</TableCell>
                        <TableCell>{m.name}</TableCell>
                        <TableCell>{m.brand_id}</TableCell>
                        <TableCell>{m.device_type_id}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/devices/models/${m.id}/edit`}>Edit</Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="ml-2"
                            onClick={async () => {
                              await deleteDeviceModel(m.id)
                              router.refresh()
                            }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No models found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
