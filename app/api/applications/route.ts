import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { jobPostId, tailoredCvContent, coverLetterContent } = await request.json()

    // Create application record
    const application = await sql`
      INSERT INTO applications (
        user_id, job_post_id, status, tailored_cv_content, cover_letter_content, application_date
      )
      VALUES (
        ${user.id}, ${jobPostId}, 'draft', ${tailoredCvContent}, ${coverLetterContent}, NOW()
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      application: application[0],
    })
  } catch (error) {
    console.error("Application creation error:", error)
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const applications = await sql`
      SELECT a.*, j.title, j.company, j.location
      FROM applications a
      JOIN job_posts j ON a.job_post_id = j.id
      WHERE a.user_id = ${user.id}
      ORDER BY a.created_at DESC
    `

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("Applications fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}
