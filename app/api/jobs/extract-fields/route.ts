import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"

const jobSchema = z.object({
  title: z.string().describe("Job title"),
  company: z.string().describe("Company name"),
  location: z.string().describe("Job location (city, state, country or 'Remote')"),
  description: z.string().describe("Full job description"),
  requirements: z.string().describe("Job requirements and qualifications"),
  benefits: z.string().optional().describe("Benefits and perks mentioned"),
  salaryRange: z.string().optional().describe("Salary range if mentioned"),
  jobType: z
    .string()
    .optional()
    .describe("Type of employment: full-time, part-time, contract, freelance, or internship"),
  applicationUrl: z.string().optional().describe("URL to apply for the job if mentioned"),
  sourceUrl: z.string().optional().describe("Source URL where the job was found"),
})

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    if (!content || content.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: "Content is too short. Please paste a complete job posting." },
        { status: 400 },
      )
    }

    console.log("[v0] Extracting job fields with AI from pasted content")

    const model = "anthropic/claude-3-5-sonnet-20241022"

    const { object: jobData } = await generateObject({
      model,
      schema: jobSchema,
      prompt: `Extract job posting information from this pasted content.

Content:
${content.slice(0, 10000)}

Extract the following information accurately:
- Job title
- Company name
- Location (or "Remote" if remote work)
- Full job description (clean and formatted)
- Requirements and qualifications (clean and formatted)
- Benefits and perks (if mentioned)
- Salary range (if mentioned)
- Job type (full-time, part-time, contract, freelance, or internship)
- Application URL (if mentioned)
- Source URL (if mentioned)

Be accurate and extract only information that is clearly stated. Format the description and requirements in a clean, readable way.`,
    })

    console.log("[v0] AI extracted job fields:", jobData)

    return NextResponse.json({
      success: true,
      data: jobData,
    })
  } catch (error: any) {
    console.error("[v0] Error extracting job fields:", error)

    let errorMessage = error.message || "Failed to extract job data"

    if (error.message?.includes("credit card") || error.message?.includes("AI Gateway")) {
      errorMessage =
        "AI Gateway requires a credit card or AI integration. Please add Groq (free) from Settings > Integrations."
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
