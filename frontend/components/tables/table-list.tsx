"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, ChevronUp, ChevronDown, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Type definitions
interface ColumnDef<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
  className?: string
  sortable?: boolean
  width?: string
}

interface ActionConfig<T> {
  label: string
  icon?: React.ReactNode
  onClick: (item: T) => void
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm"
}

interface TableListProps<T extends Record<string, any>> {
  data: T[]
  columns: ColumnDef<T>[]
  title?: string
  description?: string
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onView?: (item: T) => void
  itemsPerPage?: number
  searchableFields?: (keyof T)[]
  rowIdKey?: keyof T
  loading?: boolean
  emptyMessage?: string
}

interface SortConfig<T> {
  key: keyof T | null
  direction: "asc" | "desc"
}

export const TableList = <T extends Record<string, any>>({
  data,
  columns,
  title,
  description,
  onEdit,
  onDelete,
  onView,
  itemsPerPage = 10,
  searchableFields = [],
  rowIdKey = "id" as keyof T,
  loading = false,
  emptyMessage = "No data available",
}: TableListProps<T>) => {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: null,
    direction: "asc",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set())

  const filteredData = useMemo(() => {
    if (!searchTerm || searchableFields.length === 0) return data
    return data.filter((item) =>
      searchableFields.some((field) => String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [data, searchTerm, searchableFields])

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData
    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key!]
      const bVal = b[sortConfig.key!]

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })
    return sorted
  }, [filteredData, sortConfig])

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedData.slice(start, start + itemsPerPage)
  }, [sortedData, currentPage, itemsPerPage])

  const handleSort = (key: keyof T | string) => {
    setSortConfig((prev) => ({
      key: key as keyof T,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
    setCurrentPage(1)
  }

  const handleRowSelect = (rowId: any) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(rowId)) {
        newSet.delete(rowId)
      } else {
        newSet.add(rowId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length && paginatedData.length > 0) {
      setSelectedRows(new Set())
    } else {
      const newSet = new Set(paginatedData.map((item) => item[rowIdKey]))
      setSelectedRows(newSet)
    }
  }

  const getSortIcon = (columnKey: keyof T | string) => {
    if (sortConfig.key !== columnKey) return null
    return sortConfig.direction === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  const actionButtons: ActionConfig<T>[] = []
  if (onView) {
    actionButtons.push({
      label: "View",
      icon: <Eye className="w-4 h-4" />,
      onClick: onView,
      variant: "ghost",
      size: "icon-sm",
    })
  }
  if (onEdit) {
    actionButtons.push({
      label: "Edit",
      icon: <Edit className="w-4 h-4" />,
      onClick: onEdit,
      variant: "ghost",
      size: "icon-sm",
    })
  }
  if (onDelete) {
    actionButtons.push({
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: onDelete,
      variant: "ghost",
      size: "icon-sm",
    })
  }

  return (
    <div className="w-full space-y-4">
      {(title || description) && (
        <div className="space-y-1">
          {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}

      {searchableFields.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={`Search by ${searchableFields.join(", ")}...`}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10 max-w-md"
          />
        </div>
      )}

      <div className="rounded-lg border overflow-hidden bg-card">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/50 z-20">
              <TableRow>
                <TableHead className="w-12 px-4">
                  <Checkbox
                    checked={paginatedData.length > 0 && selectedRows.size === paginatedData.length}
                    onChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </TableHead>

                {columns.map((column) => (
                  <TableHead
                    key={String(column.key)}
                    className={cn(
                      column.className,
                      column.sortable !== false && "cursor-pointer hover:bg-muted/70 transition-colors",
                    )}
                    style={{ width: column.width }}
                    onClick={() => {
                      if (column.sortable !== false) {
                        handleSort(column.key)
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{column.header}</span>
                      {column.sortable !== false && getSortIcon(column.key)}
                    </div>
                  </TableHead>
                ))}

                {actionButtons.length > 0 && (
                  <TableHead className="w-40 px-4 text-center">
                    <span className="font-semibold">Actions</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                [...Array(3)].map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell colSpan={columns.length + (actionButtons.length > 0 ? 2 : 1)}>
                      <div className="h-8 bg-muted/30 rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, rowIndex) => (
                  <TableRow key={rowIndex} className="hover:bg-muted/50">
                    <TableCell className="w-12 px-4">
                      <Checkbox
                        checked={selectedRows.has(item[rowIdKey])}
                        onChange={() => handleRowSelect(item[rowIdKey])}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                    </TableCell>

                    {columns.map((column) => (
                      <TableCell key={String(column.key)} className={column.className}>
                        {column.render ? column.render(item) : String(item[column.key as keyof T] || "—")}
                      </TableCell>
                    ))}

                    {actionButtons.length > 0 && (
                      <TableCell className="px-4">
                        <div className="flex gap-2 justify-center">
                          {actionButtons.map((action, idx) => (
                            <Button
                              key={idx}
                              size={action.size || "icon-sm"}
                              variant={action.variant || "ghost"}
                              onClick={(e) => {
                                e.stopPropagation()
                                action.onClick(item)
                              }}
                              title={action.label}
                              className="[&_svg]:size-4"
                            >
                              {action.icon || action.label}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + (actionButtons.length > 0 ? 2 : 1)} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-muted-foreground text-sm">{emptyMessage}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {sortedData.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)}{" "}
            of {sortedData.length} results
            {selectedRows.size > 0 && <span className="ml-4 font-semibold">{selectedRows.size} row(s) selected</span>}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="px-3 py-1 text-sm font-medium">
                {currentPage} / {totalPages}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export type { ColumnDef, ActionConfig, TableListProps }
