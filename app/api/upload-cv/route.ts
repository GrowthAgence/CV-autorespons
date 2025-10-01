import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("cv") as File
    const email = formData.get("email") as string

    if (!file || !email) {
      return NextResponse.json({ error: "File and email are required" }, { status: 400 })
    }

    // In a real implementation, you would:
    // 1. Upload file to cloud storage (Vercel Blob, S3, etc.)
    // 2. Extract text content from PDF/DOC
    // 3. Store file URL and content in database

    // For now, we'll just simulate the upload
    const fileUrl = `/uploads/${Date.now()}-${file.name}`

    await sql`
      UPDATE profiles 
      SET cv_file_url = ${fileUrl}
      WHERE email = ${email}
    `

    return NextResponse.json({
      success: true,
      fileUrl,
      message: "CV uploaded successfully",
    })
  } catch (error) {
    console.error("CV upload error:", error)
    return NextResponse.json({ error: "Failed to upload CV" }, { status: 500 })
  }
}
