"use client"

import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useProblems, useProblemMutations } from "@/hooks/useProblems"
import { useRouter } from "next/navigation"
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

export default function AdminProblemsPage() {
  const [page, setPage] = useState(1)
  const limit = 10
  const offset = (page - 1) * limit
  
  const { data, total, loading, error } = useProblems(limit, offset)
  const { deleteProblem } = useProblemMutations()
  const router = useRouter()
  
  const totalPages = Math.ceil(total / limit)

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Problems</h2>
            <Button asChild>
              <Link href="/admin/problem/add">Add Problem</Link>
            </Button>
          </div>
          <Separator className="my-4" />
          {loading && data.length === 0 && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!error && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Problems ({total})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Device Type ID</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((problem) => (
                      <TableRow key={problem.id}>
                        <TableCell>#{problem.id}</TableCell>
                        <TableCell>{problem.name}</TableCell>
                        <TableCell>{problem.description || "-"}</TableCell>
                        <TableCell>{problem.device_type?.name || problem.device_type_id}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <Link href={`/admin/problem/${problem.id}/edit`}>Edit</Link>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={async () => {
                                if (confirm("Are you sure?")) {
                                  await deleteProblem(problem.id)
                                  window.location.reload()
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {data.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No problems found
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
                                    } else if (
                                        p === page - 2 ||
                                        p === page + 2
                                    ) {
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
