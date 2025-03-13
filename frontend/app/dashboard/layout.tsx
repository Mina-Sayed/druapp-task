"use client"

import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar className="hidden md:block w-64" />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}

