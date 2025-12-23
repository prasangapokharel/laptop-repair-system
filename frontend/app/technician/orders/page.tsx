"use client";
import { TechnicianSidebar } from "@/components/sidebar/technician"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useOrders } from "@/hooks/useOrders"
import { OrdersTable } from "@/components/tables/OrdersTable"
import { useState } from "react"
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

export default function TechnicianOrdersPage() {
  const [page, setPage] = useState(1)
  const limit = 12
  const offset = (page - 1) * limit
  const { data, total, loading, error } = useOrders({ limit, offset })
  const totalPages = Math.ceil(total / limit)
  return (
    <SidebarProvider>
      <TechnicianSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Orders</h2>
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
                <OrdersTable orders={data} />
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
