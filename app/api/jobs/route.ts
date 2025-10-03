import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import type { Profile } from "@/lib/database"

async function getUserFromRequest(request: NextRequest): Promise<Profile | null> {
  try {
    const sessionId = request.cookies.get("session_id")?.value

    console.log("[v0] Checking session from request, session_id:", sessionId)

    if (!sessionId) {
      console.log("[v0] No session_id cookie found in request")
      return null
    }

    const result = await sql`
      SELECT * FROM profiles 
      WHERE email = ${sessionId}
      LIMIT 1
    `

    console.log("[v0] User lookup result:", result.length > 0 ? "User found" : "User not found")

    if (result.length > 0) {
      console.log("[v0] User email:", result[0].email, "ID:", result[0].id)
    }

    return (result[0] as Profile) || null
  } catch (error) {
    console.error("[v0] Error getting user from request:", error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Job creation request received")
    const user = await getUserFromRequest(request)

    if (!user) {
      console.log("[v0] Unauthorized job creation attempt - no user found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] User authenticated:", user.email, "ID:", user.id)

    const body = await request.json()
    console.log("[v0] Request body:", JSON.stringify(body, null, 2))
    console.log("[v0] Creating job for user:", user.id)

    try {
      const jobPost = await sql`
        INSERT INTO job_posts (
          id, user_id, title, company, location, job_type, salary_range,
          description, requirements, benefits, application_url, source_url,
          deadline, status, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), ${user.id}, ${body.title}, ${body.company}, ${body.location || null},
          ${body.jobType || null}, ${body.salaryRange || null}, ${body.description},
          ${body.requirements || null}, ${body.benefits || null}, ${body.applicationUrl || null},
          ${body.sourceUrl || null}, ${body.deadline ? new Date(body.deadline) : null}, 'active',
          now(), now()
        )
        RETURNING *
      `

      console.log("[v0] Job created successfully:", jobPost[0].id)
      return NextResponse.json({ success: true, job: jobPost[0] })
    } catch (dbError) {
      console.error("[v0] Database error:", dbError)
      console.error("[v0] Error name:", dbError instanceof Error ? dbError.name : "Unknown")
      console.error("[v0] Error message:", dbError instanceof Error ? dbError.message : String(dbError))
      console.error("[v0] Error stack:", dbError instanceof Error ? dbError.stack : "No stack")
      throw dbError
    }
  } catch (error) {
    console.error("[v0] Job creation error:", error)
    console.error("[v0] Error type:", typeof error)
    console.error("[v0] Error details:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      {
        error: "Failed to create job",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
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
