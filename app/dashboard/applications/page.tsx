import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/database"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ApplicationsList } from "@/components/dashboard/applications-list"
import { ApplicationsStats } from "@/components/dashboard/applications-stats"

export default async function ApplicationsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/onboarding")
  }

  // Fetch applications with job details
  const applications = await sql`
    SELECT 
      a.*,
      j.title,
      j.company,
      j.location,
      j.salary_range,
      j.application_url
    FROM applications a
    JOIN job_posts j ON a.job_post_id = j.id
    WHERE a.user_id = ${user.id}
    ORDER BY a.created_at DESC
  `

  // Calculate stats
  const stats = {
    total: applications.length,
    draft: applications.filter((a) => a.status === "draft").length,
    submitted: applications.filter((a) => a.status === "submitted").length,
    interview: applications.filter((a) => a.status === "interview").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold uppercase tracking-tight md:text-4xl">Application Tracker</h1>
          <p className="text-muted-foreground">Manage and track all your job applications in one place</p>
        </div>

        <ApplicationsStats stats={stats} />

        <div className="mt-8">
          <ApplicationsList applications={applications} />
        </div>
      </main>
    </div>
  )
}
