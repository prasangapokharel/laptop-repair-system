"use client";
import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { usePayments } from "@/hooks/usePayments"

function formatAmount(a?: string | null) {
  if (!a) return "रु 0"
  return `रु ${a}`
}

function formatDate(d?: string | null) {
  if (!d) return "-"
  try {
    return new Date(d).toLocaleString()
  } catch {
    return d
  }
}

export default function AdminPaymentsPage() {
  const { data, loading, error } = usePayments({ limit: 10, offset: 0 })

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Payments</h2>
            <Separator className="my-4" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && <p>Loading payments...</p>}
              {error && <p className="text-red-500">{error}</p>}
              {!loading && !error && (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Txn ID</TableHead>
                        <TableHead>Paid At</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.id}</TableCell>
                          <TableCell>
                            <Link href="/admin/orders">{p.order_id}</Link>
                          </TableCell>
                          <TableCell>{formatAmount(p.amount)}</TableCell>
                          <TableCell>{formatAmount(p.due_amount)}</TableCell>
                          <TableCell>
                            <Badge variant={p.status === "Paid" ? "default" : p.status === "Partial" ? "secondary" : "outline"}>
                              {p.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{p.payment_method || "-"}</TableCell>
                          <TableCell>{p.transaction_id || "-"}</TableCell>
                          <TableCell>{formatDate(p.paid_at)}</TableCell>
                          <TableCell>{formatDate(p.created_at)}</TableCell>
                        </TableRow>
                      ))}
                      {data.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground">
                            No payments found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

