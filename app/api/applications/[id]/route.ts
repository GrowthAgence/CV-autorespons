import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/database"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const body = await request.json()

    const updateFields: any = {}
    if (body.status) updateFields.status = body.status
    if (body.notes !== undefined) updateFields.notes = body.notes
    if (body.interview_date !== undefined) {
      updateFields.interview_date = body.interview_date ? new Date(body.interview_date) : null
    }
    if (body.follow_up_date !== undefined) {
      updateFields.follow_up_date = body.follow_up_date ? new Date(body.follow_up_date) : null
    }

    // Build dynamic SQL update query
    const setClause = Object.keys(updateFields)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ")

    const values = [resolvedParams.id, user.id, ...Object.values(updateFields)]

    const result = await sql`
      UPDATE applications 
      SET ${sql.unsafe(setClause)}, updated_at = NOW()
      WHERE id = ${resolvedParams.id} AND user_id = ${user.id}
      RETURNING *
    `

    if (!result.length) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      application: result[0],
    })
  } catch (error) {
    console.error("Application update error:", error)
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
  }
}
