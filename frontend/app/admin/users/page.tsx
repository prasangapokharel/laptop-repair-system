"use client";
import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useUsers } from "@/hooks/useUsers"
import { useUserMutations } from "@/hooks/useUserMutations"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
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

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const limit = 10
  const offset = (page - 1) * limit
  
  const { data, total, loading, error, refetch } = useUsers(limit, offset)
  const { deleteUser, updateUser } = useUserMutations()
  const router = useRouter()
  
  const totalPages = Math.ceil(total / limit)

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Users</h2>
            <Button asChild>
              <Link href="/admin/users/add">Add User</Link>
            </Button>
          </div>
          <Separator className="my-4" />
          {loading && data.length === 0 && <p>Loading users...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!error && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Users ({total})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>#{user.id}</TableCell>
                        <TableCell>{user.full_name}</TableCell>
                        <TableCell>{user.email || "-"}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.role?.name || "-"}</TableCell>
                        <TableCell>{user.is_staff ? "Yes" : "No"}</TableCell>
                        <TableCell>
                          <Switch
                            checked={user.is_active}
                            onCheckedChange={async (checked) => {
                              try {
                                await updateUser(user.id, { is_active: checked })
                                refetch()
                              } catch (e) {
                                alert("Failed to update status")
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/users/${user.id}/edit`}>Edit</Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="ml-2"
                            onClick={async () => {
                              if (confirm("Are you sure?")) {
                                await deleteUser(user.id)
                                router.refresh()
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {data.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
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
                           // Show first, last, current, and surrounding
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
