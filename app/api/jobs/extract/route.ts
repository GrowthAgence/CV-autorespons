import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

const jobSchema = z.object({
  title: z.string().describe("Job title"),
  company: z.string().describe("Company name"),
  location: z.string().describe("Job location (city, state, country or 'Remote')"),
  description: z.string().describe("Full job description"),
  requirements: z.string().describe("Job requirements and qualifications"),
  salaryRange: z.string().optional().describe("Salary range if mentioned"),
  jobType: z.enum(["full-time", "part-time", "contract", "internship"]).describe("Type of employment"),
  applicationUrl: z.string().describe("URL to apply for the job"),
})

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const { url, html, text } = await request.json()

    console.log("[v0] Extracting job data with AI from:", url)

    const { object: jobData } = await generateObject({
      model: "openai/gpt-4o-mini",
      schema: jobSchema,
      prompt: `Extract job posting information from this web page content.
      
URL: ${url}

Page Text Content:
${text.slice(0, 8000)}

Extract the following information:
- Job title
- Company name
- Location (or "Remote" if remote work)
- Full job description
- Requirements and qualifications
- Salary range (if mentioned, otherwise leave empty)
- Job type (full-time, part-time, contract, or internship)
- Application URL (use the page URL: ${url})

Be accurate and extract only information that is clearly stated on the page.`,
    })

    console.log("[v0] AI extracted job data:", jobData)

    const result = await sql`
      INSERT INTO jobs (
        title, company, location, description, requirements,
        salary_range, job_type, application_url, source_url,
        status, created_at
      ) VALUES (
        ${jobData.title},
        ${jobData.company},
        ${jobData.location},
        ${jobData.description},
        ${jobData.requirements},
        ${jobData.salaryRange || ""},
        ${jobData.jobType},
        ${jobData.applicationUrl},
        ${url},
        'saved',
        NOW()
      )
      RETURNING *
    `

    console.log("[v0] Job saved to database:", result[0])

    return NextResponse.json(
      {
        success: true,
        job: result[0],
        extracted: jobData,
      },
      { headers: corsHeaders },
    )
  } catch (error: any) {
    console.error("[v0] Error extracting job:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders })
  }
}
