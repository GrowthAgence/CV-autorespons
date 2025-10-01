import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/database"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ApplicationDetails } from "@/components/dashboard/application-details"

interface ApplicationPageProps {
  params: Promise<{ id: string }>
}

export default async function ApplicationPage({ params }: ApplicationPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/onboarding")
  }

  const resolvedParams = await params

  // Fetch application with job details
  const applicationResult = await sql`
    SELECT 
      a.*,
      j.title,
      j.company,
      j.location,
      j.salary_range,
      j.description,
      j.requirements,
      j.application_url,
      j.source_url
    FROM applications a
    JOIN job_posts j ON a.job_post_id = j.id
    WHERE a.id = ${resolvedParams.id} AND a.user_id = ${user.id}
    LIMIT 1
  `

  if (!applicationResult.length) {
    redirect("/dashboard/applications")
  }

  const application = applicationResult[0]

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <ApplicationDetails application={application} userProfile={user} />
      </main>
    </div>
  )
}
