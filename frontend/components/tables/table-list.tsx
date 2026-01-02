"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Search, MoreHorizontal, Loader2 } from "lucide-react"
import { useState, useMemo } from "react"

interface TableColumn {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
  sortable?: boolean
  width?: string
  searchable?: boolean
}

interface TableListProps {
  title: string
  description?: string
  data: any[]
  columns: TableColumn[]
  isLoading?: boolean
  error?: string
  totalCount?: number
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  actions?: {
    label: string
    icon?: React.ReactNode
    href?: (id: number) => string
    onClick?: (id: number) => void
    variant?: "default" | "outline" | "secondary" | "destructive" | "ghost"
    className?: string
  }[]
  emptyMessage?: string
  showSearch?: boolean
}

export function TableList({
  title,
  description,
  data = [],
  columns,
  isLoading = false,
  error,
  totalCount = 0,
  currentPage = 1,
  pageSize = 12,
  onPageChange,
  actions = [],
  emptyMessage = "No data found",
  showSearch = true,
}: TableListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const totalPages = Math.ceil(totalCount / pageSize)

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return []
    if (!searchQuery.trim()) return data
    
    const query = searchQuery.toLowerCase()
    return data.filter((row) =>
      columns.some((col) => {
        if (col.searchable === false) return false
        const value = row[col.key]
        return value && String(value).toLowerCase().includes(query)
      })
    )
  }, [data, searchQuery, columns])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg">
                {title} <span className="text-muted-foreground">({totalCount})</span>
              </CardTitle>
            </div>
            {showSearch && (
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm bg-background"
                />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">Loading data...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-500 font-medium mb-2">Error loading data</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          ) : !filteredData || filteredData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-muted-foreground font-medium mb-1">{emptyMessage}</p>
                {searchQuery && (
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search criteria
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-border/50">
                <Table>
                  <TableHeader className="bg-muted/30 hover:bg-muted/30">
                    <TableRow className="border-border/50 hover:bg-transparent">
                      {columns.map((column) => (
                        <TableHead
                          key={column.key}
                          className={`font-semibold text-xs uppercase tracking-wider text-muted-foreground ${column.width || ""}`}
                        >
                          {column.label}
                        </TableHead>
                      ))}
                      {actions.length > 0 && (
                        <TableHead className="text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((row, idx) => (
                      <TableRow
                        key={row.id || idx}
                        className="border-border/50 hover:bg-muted/40 transition-colors"
                      >
                        {columns.map((column) => (
                          <TableCell
                            key={`${row.id}-${column.key}`}
                            className="py-3 text-sm"
                          >
                            {column.render
                              ? column.render(row[column.key], row)
                              : row[column.key] || "-"}
                          </TableCell>
                        ))}
                        {actions.length > 0 && (
                          <TableCell className="text-right">
                            {actions.length === 1 ? (
                              actions[0].href ? (
                                <Link href={actions[0].href(row.id)}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    {actions[0].icon || actions[0].label}
                                  </Button>
                                </Link>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => actions[0].onClick?.(row.id)}
                                >
                                  {actions[0].icon || actions[0].label}
                                </Button>
                              )
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {actions.map((action, actionIdx) => (
                                    action.href ? (
                                      <Link
                                        key={actionIdx}
                                        href={action.href(row.id)}
                                      >
                                        <DropdownMenuItem
                                          className={action.className}
                                        >
                                          {action.icon && (
                                            <span className="mr-2">{action.icon}</span>
                                          )}
                                          {action.label}
                                        </DropdownMenuItem>
                                      </Link>
                                    ) : (
                                      <DropdownMenuItem
                                        key={actionIdx}
                                        onClick={() => action.onClick?.(row.id)}
                                        className={action.className}
                                      >
                                        {action.icon && (
                                          <span className="mr-2">{action.icon}</span>
                                        )}
                                        {action.label}
                                      </DropdownMenuItem>
                                    )
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && onPageChange && (
                <div className="mt-6 flex items-center justify-between gap-4">
                  <p className="text-xs text-muted-foreground">
                    Page {currentPage} of {totalPages} • {totalCount} total items
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (currentPage > 1) onPageChange(currentPage - 1)
                          }}
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (p) => {
                          if (
                            p === 1 ||
                            p === totalPages ||
                            (p >= currentPage - 1 && p <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={p}>
                                <PaginationLink
                                  href="#"
                                  isActive={currentPage === p}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    onPageChange(p)
                                  }}
                                >
                                  {p}
                                </PaginationLink>
                              </PaginationItem>
                            )
                          } else if (
                            p === currentPage - 2 ||
                            p === currentPage + 2
                          ) {
                            return (
                              <PaginationItem key={p}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )
                          }
                          return null
                        }
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (currentPage < totalPages)
                              onPageChange(currentPage + 1)
                          }}
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
