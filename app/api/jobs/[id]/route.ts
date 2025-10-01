import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/database"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const job = await sql`
      SELECT * FROM job_posts 
      WHERE id = ${resolvedParams.id} AND user_id = ${user.id}
      LIMIT 1
    `

    if (!job.length) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({ job: job[0] })
  } catch (error) {
    console.error("Job fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params

    // First, delete all applications associated with this job
    await sql`
      DELETE FROM applications 
      WHERE job_post_id = ${resolvedParams.id} AND user_id = ${user.id}
    `

    // Then delete the job post
    const result = await sql`
      DELETE FROM job_posts 
      WHERE id = ${resolvedParams.id} AND user_id = ${user.id}
      RETURNING id
    `

    if (!result.length) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Job deleted successfully" })
  } catch (error) {
    console.error("Job deletion error:", error)
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 })
  }
}
