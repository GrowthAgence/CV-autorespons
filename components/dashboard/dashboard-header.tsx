import Link from "next/link"
import { BrutalButton } from "@/components/ui/brutal-button"
import { BrutalBadge } from "@/components/ui/brutal-badge"
import type { Profile } from "@/lib/database"

interface DashboardHeaderProps {
  user: Profile
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="border-b-4 border-foreground bg-muted">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-2xl font-bold uppercase tracking-wide">
              JobBot
            </Link>
            <BrutalBadge variant="success">ACTIVE</BrutalBadge>
          </div>

          <nav className="flex items-center gap-4">
            <BrutalButton variant="outline" size="sm" asChild>
              <Link href="/dashboard">JOBS</Link>
            </BrutalButton>
            <BrutalButton variant="outline" size="sm" asChild>
              <Link href="/dashboard/applications">APPLICATIONS</Link>
            </BrutalButton>
            <BrutalButton variant="outline" size="sm" asChild>
              <Link href="/dashboard/add-job">ADD JOB</Link>
            </BrutalButton>
            <BrutalButton variant="secondary" size="sm" asChild>
              <Link href="/dashboard/profile">PROFILE</Link>
            </BrutalButton>
            <BrutalButton variant="ghost" size="sm" asChild>
              <Link href="/api/auth/logout">LOGOUT</Link>
            </BrutalButton>
          </nav>
        </div>
      </div>
    </header>
  )
}
