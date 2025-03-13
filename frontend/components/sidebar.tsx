"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NavLink } from "@/components/nav-link"
import { Home, Calendar, MessageSquare, Settings, Users, Video } from "lucide-react"
import { usePathname } from "next/navigation"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12 border-r bg-sidebar", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <NavLink href="/dashboard" icon={Home}>
              Dashboard
            </NavLink>
            <NavLink href="/dashboard/appointments" icon={Calendar}>
              Appointments
            </NavLink>
            <NavLink href="/dashboard/messages" icon={MessageSquare}>
              Messages
            </NavLink>
            <NavLink href="/dashboard/consultations" icon={Video}>
              Video Consultations
            </NavLink>
            <NavLink href="/dashboard/patients" icon={Users}>
              Patients
            </NavLink>
            <NavLink href="/dashboard/settings" icon={Settings}>
              Settings
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  )
}

