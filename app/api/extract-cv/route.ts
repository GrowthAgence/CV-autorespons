import { type NextRequest, NextResponse } from "next/server"
import { extractCVData } from "@/lib/ai-generation"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Extract CV API called")

    const body = await request.json()
    const { text } = body

    if (!text || typeof text !== "string") {
      console.log("[v0] No text provided")
      return NextResponse.json({ error: "CV text is required" }, { status: 400 })
    }

    console.log("[v0] Received text, length:", text.length, "characters")

    if (text.trim().length < 50) {
      console.log("[v0] Insufficient text provided")
      return NextResponse.json(
        {
          error: "Text is too short. Please provide at least 50 characters of CV content.",
        },
        { status: 400 },
      )
    }

    console.log("[v0] Extracting structured data with AI...")
    console.log("[v0] First 200 chars of text:", text.substring(0, 200))

    // Use AI to extract structured data
    const extractedData = await extractCVData(text)

    console.log("[v0] Successfully extracted CV data:", {
      hasPersonalInfo: !!extractedData.personalInfo,
      name: extractedData.personalInfo?.fullName,
      email: extractedData.personalInfo?.email,
      skillsCount: extractedData.skills?.length || 0,
      experienceCount: extractedData.experience?.length || 0,
      educationCount: extractedData.education?.length || 0,
      certificationsCount: extractedData.certifications?.length || 0,
    })

    return NextResponse.json({
      success: true,
      data: extractedData,
    })
  } catch (error: any) {
    console.error("[v0] CV extraction error:", error)
    console.error("[v0] Error stack:", error.stack)
    return NextResponse.json(
      {
        error: error.message || "Failed to extract CV data. Please try again or contact support.",
      },
      { status: 500 },
    )
  }
}
