import { type NextRequest, NextResponse } from "next/server"
import { createOrUpdateProfile } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const profile = await createOrUpdateProfile({
      email: body.email,
      full_name: body.fullName,
      phone: body.phone,
      location: body.location,
      linkedin_url: body.linkedinUrl,
      github_url: body.githubUrl,
      portfolio_url: body.portfolioUrl,
      summary: body.summary,
      skills: body.skills,
      experience: body.experience,
      education: body.education,
      certifications: body.certifications,
    })

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    console.error("Profile creation error:", error)
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
  }
}
