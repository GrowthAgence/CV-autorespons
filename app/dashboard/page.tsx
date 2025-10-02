import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/database"
import type { JobPost } from "@/lib/database"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { JobsList } from "@/components/dashboard/jobs-list"
import { StatsCards } from "@/components/dashboard/stats-cards"

interface JobPostWithApplication extends JobPost {
  application_date?: string | null
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/onboarding")
  }

  const firstName = user.full_name?.split(" ")[0] || "there"

  const jobPosts = (await sql`
    SELECT 
      jp.*,
      a.application_date
    FROM job_posts jp
    LEFT JOIN applications a ON jp.id = a.job_post_id AND a.user_id = ${user.id}
    WHERE jp.user_id = ${user.id} 
    ORDER BY jp.created_at DESC
  `) as JobPostWithApplication[]

  const applications = await sql`
    SELECT status, COUNT(*) as count
    FROM applications 
    WHERE user_id = ${user.id}
    GROUP BY status
  `

  const stats = {
    totalJobs: jobPosts.length,
    activeApplications: applications.find((a) => a.status === "submitted")?.count || 0,
    interviews: applications.find((a) => a.status === "interview")?.count || 0,
    responseRate:
      jobPosts.length > 0
        ? Math.round((applications.reduce((acc, curr) => acc + Number(curr.count), 0) / jobPosts.length) * 100)
        : 0,
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold uppercase tracking-tight md:text-4xl">Welcome back, {firstName}</h1>
          <p className="text-muted-foreground">Manage your job applications and let AI do the heavy lifting</p>
        </div>

        <StatsCards stats={stats} />

        <div className="mt-8">
          <JobsList jobs={jobPosts} />
        </div>
      </main>
    </div>
  )
}
