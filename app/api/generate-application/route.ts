import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/database"
import {
  generateTailoredCV,
  generateCoverLetter,
  extractJobSkills,
  detectLanguage,
  type UserFacts,
} from "@/lib/ai-generation"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] User profile data:", {
      hasFullName: !!user.full_name,
      hasEmail: !!user.email,
      hasPhone: !!user.phone,
      hasLocation: !!user.location,
      hasSummary: !!user.summary,
      skillsCount: user.skills?.length || 0,
      experienceCount: user.experience?.length || 0,
      educationCount: user.education?.length || 0,
      certificationsCount: user.certifications?.length || 0,
    })

    const { jobId } = await request.json()

    // Fetch job details
    const jobResult = await sql`
      SELECT * FROM job_posts 
      WHERE id = ${jobId} AND user_id = ${user.id}
      LIMIT 1
    `

    if (!jobResult.length) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const job = jobResult[0]

    const jobLanguage = await detectLanguage(job.description + " " + (job.requirements || ""))
    console.log("[v0] Detected job language:", jobLanguage)

    // Extract skills from job description
    const jobSkills = await extractJobSkills(job.description, job.requirements)

    // Prepare user facts for AI generation
    const userFacts: UserFacts = {
      personalInfo: {
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        linkedinUrl: user.linkedin_url,
        githubUrl: user.github_url,
        portfolioUrl: user.portfolio_url,
      },
      summary: user.summary,
      skills: user.skills || [],
      experience: user.experience || [],
      education: user.education || [],
      certifications: user.certifications || [],
    }

    console.log("[v0] User facts being sent to AI:", JSON.stringify(userFacts, null, 2))

    const jobRequirements = {
      title: job.title,
      company: job.company,
      description: job.description,
      requirements: job.requirements,
      skills: jobSkills,
      location: job.location,
    }

    const [cv, coverLetter] = await Promise.all([
      generateTailoredCV(userFacts, jobRequirements, jobLanguage),
      generateCoverLetter(userFacts, jobRequirements, jobLanguage),
    ])

    console.log("[v0] Generation completed successfully in language:", jobLanguage)

    return NextResponse.json({
      success: true,
      cv,
      coverLetter,
      extractedSkills: jobSkills,
      language: jobLanguage,
      userDataSummary: {
        hasExperience: (user.experience?.length || 0) > 0,
        hasEducation: (user.education?.length || 0) > 0,
        hasCertifications: (user.certifications?.length || 0) > 0,
        skillsCount: user.skills?.length || 0,
      },
    })
  } catch (error) {
    console.error("Application generation error:", error)
    return NextResponse.json({ error: "Failed to generate application" }, { status: 500 })
  }
}
