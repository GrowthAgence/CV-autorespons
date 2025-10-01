import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

// This endpoint will be called by the Chrome extension
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userEmail, jobData } = body

    if (!userEmail || !jobData) {
      return NextResponse.json({ error: "User email and job data are required" }, { status: 400 })
    }

    // Get user by email
    const user = await sql`
      SELECT id FROM profiles WHERE email = ${userEmail} LIMIT 1
    `

    if (!user.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create job post from extension data
    const jobPost = await sql`
      INSERT INTO job_posts (
        user_id, title, company, location, job_type, salary_range,
        description, requirements, benefits, application_url, source_url,
        raw_html, status
      )
      VALUES (
        ${user[0].id}, ${jobData.title}, ${jobData.company}, ${jobData.location},
        ${jobData.jobType}, ${jobData.salaryRange}, ${jobData.description},
        ${jobData.requirements}, ${jobData.benefits}, ${jobData.applicationUrl},
        ${jobData.sourceUrl}, ${jobData.rawHtml}, 'active'
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      job: jobPost[0],
      message: "Job captured successfully",
    })
  } catch (error) {
    console.error("Job capture error:", error)
    return NextResponse.json({ error: "Failed to capture job" }, { status: 500 })
  }
}
