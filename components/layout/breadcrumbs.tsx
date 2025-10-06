"use client"

import * as React from "react"
import { ChevronLeft, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { t } from "@/lib/translations"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb"

interface BreadcrumbItem {
  label: string
  href: string
}

export function Breadcrumbs() {
  const pathname = usePathname()

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [{ label: t("dashboard"), href: "/dashboard" }]

    let currentPath = ""

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`

      // Skip dashboard as it's already added
      if (segment === "dashboard") return

      let label = segment

      // Map path segments to Arabic labels
      const segmentMap: Record<string, string> = {
        members: t("members"),
        attendance: t("attendance"),
        posts: t("posts"),
        notifications: t("notifications"),
        gallery: t("gallery"),
        settings: t("settings"),
        profile: t("profile"),
        about: t("about"),
      }

      if (segmentMap[segment]) {
        label = segmentMap[segment]
      } else if (index === pathSegments.length - 1) {
        // For dynamic routes like /members/[id], show a generic label
        const parentSegment = pathSegments[index - 1]
        if (parentSegment === "members") {
          label = "تفاصيل المخدوم"
        }
      }

      breadcrumbs.push({
        label,
        href: currentPath,
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Don't show breadcrumbs on dashboard or auth or profile/complete
  if (pathname === "/dashboard" || pathname === "/auth" || pathname === "/profile/complete") {
    return null
  }

  const isCollapsed = breadcrumbs.length > 3

  return (
    <Breadcrumb className="mb-4 px-4 sm:px-6 mt-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">
              <Home className="w-4 h-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {isCollapsed ? (
          <>
            <BreadcrumbSeparator>
              <ChevronLeft className="w-4 h-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={breadcrumbs[0].href}>{breadcrumbs[0].label}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronLeft className="w-4 h-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronLeft className="w-4 h-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="bg-primary/20 px-2 py-1 rounded">
                {breadcrumbs[breadcrumbs.length - 1].label}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : (
          breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.href}>
              <BreadcrumbSeparator>
                <ChevronLeft className="w-4 h-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage className="bg-primary/20 px-2 py-1 rounded">
                    {breadcrumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
