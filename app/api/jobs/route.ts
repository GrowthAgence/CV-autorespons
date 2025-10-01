import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const jobPost = await sql`
      INSERT INTO job_posts (
        user_id, title, company, location, job_type, salary_range,
        description, requirements, benefits, application_url, source_url,
        deadline, status
      )
      VALUES (
        ${user.id}, ${body.title}, ${body.company}, ${body.location},
        ${body.jobType}, ${body.salaryRange}, ${body.description},
        ${body.requirements}, ${body.benefits}, ${body.applicationUrl},
        ${body.sourceUrl}, ${body.deadline ? new Date(body.deadline) : null}, 'active'
      )
      RETURNING *
    `

    return NextResponse.json({ success: true, job: jobPost[0] })
  } catch (error) {
    console.error("Job creation error:", error)
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const jobs = await sql`
      SELECT * FROM job_posts 
      WHERE user_id = ${user.id} 
      ORDER BY created_at DESC
    `

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("Jobs fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}
