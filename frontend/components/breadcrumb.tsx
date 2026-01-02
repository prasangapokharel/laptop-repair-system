"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}

const DEFAULT_LABELS: Record<string, string> = {
  receptionist: "Receptionist",
  dashboard: "Dashboard",
  orders: "Orders",
  customers: "Customers",
  devices: "Devices",
  problem: "Problems",
  add: "Add",
  edit: "Edit",
}

function formatSegment(segment: string): string {
  // Remove [id] or similar dynamic segments
  const clean = segment.replace(/^\[.*\]$/, "")
  return DEFAULT_LABELS[clean] || clean.charAt(0).toUpperCase() + clean.slice(1)
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const pathname = usePathname()

  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbs = items || (() => {
    const segments = pathname.split("/").filter(Boolean)
    const crumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }]

    let currentPath = ""
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      currentPath += `/${segment}`

      // Skip dynamic segments in the link
      if (segment.startsWith("[")) {
        const label = formatSegment(segment)
        crumbs.push({ label })
      } else {
        const label = formatSegment(segment)
        const isLast = i === segments.length - 1
        crumbs.push({
          label,
          href: isLast ? undefined : currentPath,
        })
      }
    }

    return crumbs
  })()

  return (
    <nav
      className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index === 0 ? (
            <Home className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}

          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
