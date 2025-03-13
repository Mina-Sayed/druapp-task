import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavLinkProps {
  href: string
  icon: LucideIcon
  children: React.ReactNode
  className?: string
}

export function NavLink({ href, icon: Icon, children, className }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
        className
      )}
    >
      <Icon className={cn("mr-2 h-4 w-4", isActive ? "text-foreground" : "text-muted-foreground")} />
      <span>{children}</span>
    </Link>
  )
} 