"use client";
import { ReceptionistSidebar } from "@/components/sidebar/receptionist"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useOrders } from "@/hooks/useOrders"
import { useUsers } from "@/hooks/useUsers"
import { useOrderMutations } from "@/hooks/useOrderMutations"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function ReceptionistOrdersPage() {
  const [page, setPage] = useState(1)
  const limit = 12
  const offset = (page - 1) * limit

  const { data, total, loading, error } = useOrders({ limit, offset })
  const { data: users } = useUsers(100, 0)
  const { assignOrder } = useOrderMutations()
  const [selected, setSelected] = useState<Record<number, number | null>>({})
  
  const totalPages = Math.ceil(total / limit)

  return (
    <SidebarProvider>
      <ReceptionistSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Orders</h2>
            <Button asChild>
              <Link href="/receptionist/orders/add">Create Order</Link>
            </Button>
          </div>
          <Separator className="my-4" />
          {loading && data.length === 0 && <p>Loading orders...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!error && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Orders ({total})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{order.status}</TableCell>
                        <TableCell>रु {order.cost}</TableCell>
                        <TableCell>रु {order.discount}</TableCell>
                        <TableCell>रु {order.total_cost}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/receptionist/orders/${order.id}/edit`}>Edit</Link>
                          </Button>
                          <div className="mt-2 flex items-center gap-2">
                            <Select
                              onValueChange={(v) =>
                                setSelected((prev) => ({ ...prev, [order.id]: Number(v) }))
                              }
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Assign user" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.map((u) => (
                                  <SelectItem key={u.id} value={String(u.id)}>
                                    {u.full_name} • #{u.id}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="secondary"
                              onClick={async () => {
                                const uid = selected[order.id]
                                if (uid) await assignOrder(order.id, uid)
                              }}
                            >
                              Assign
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {data.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No orders found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
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
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                          if (
                            p === 1 ||
                            p === totalPages ||
                            (p >= page - 1 && p <= page + 1)
                          ) {
                            return (
                              <PaginationItem key={p}>
                                <PaginationLink
                                  href="#"
                                  isActive={page === p}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setPage(p)
                                  }}
                                >
                                  {p}
                                </PaginationLink>
                              </PaginationItem>
                            )
                          } else if (p === page - 2 || p === page + 2) {
                            return (
                              <PaginationItem key={p}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )
                          }
                          return null
                        })}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              if (page < totalPages) setPage(page + 1)
                            }}
                            className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
