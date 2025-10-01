import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { groq } from "@ai-sdk/groq"

// Anti-hallucination guardrails - only use verified facts from user profile
export interface UserFacts {
  personalInfo: {
    fullName: string
    email: string
    phone?: string
    location?: string
    linkedinUrl?: string
    githubUrl?: string
    portfolioUrl?: string
  }
  summary?: string
  skills: string[]
  experience: any[]
  education: any[]
  certifications: any[]
}

export interface JobRequirements {
  title: string
  company: string
  description: string
  requirements?: string
  skills: string[]
  location?: string
}

// Fact verification system - ensures AI only uses real user data
export function verifyFacts(userFacts: UserFacts): UserFacts {
  // Remove any empty or undefined values to prevent hallucination
  const cleanFacts: UserFacts = {
    personalInfo: {
      fullName: userFacts.personalInfo.fullName || "",
      email: userFacts.personalInfo.email || "",
      phone: userFacts.personalInfo.phone || undefined,
      location: userFacts.personalInfo.location || undefined,
      linkedinUrl: userFacts.personalInfo.linkedinUrl || undefined,
      githubUrl: userFacts.personalInfo.githubUrl || undefined,
      portfolioUrl: userFacts.personalInfo.portfolioUrl || undefined,
    },
    summary: userFacts.summary || undefined,
    skills: Array.isArray(userFacts.skills) ? userFacts.skills.filter(Boolean) : [],
    experience: Array.isArray(userFacts.experience) ? userFacts.experience.filter(Boolean) : [],
    education: Array.isArray(userFacts.education) ? userFacts.education.filter(Boolean) : [],
    certifications: Array.isArray(userFacts.certifications) ? userFacts.certifications.filter(Boolean) : [],
  }

  return cleanFacts
}

async function generateWithFallback(prompt: string, maxTokens: number): Promise<string> {
  // Try Anthropic first if API key is available
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { text } = await generateText({
        model: anthropic("claude-3-5-sonnet-20241022"),
        prompt,
        maxTokens,
      })
      return text
    } catch (error: any) {
      console.warn("[v0] Anthropic failed, falling back to Groq:", error.message)
      // Fall through to Groq fallback
    }
  }

  // Fallback to Groq (free)
  try {
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      maxTokens,
    })
    return text
  } catch (error) {
    console.error("[v0] All AI providers failed:", error)
    throw new Error("Failed to generate content with AI. Please check your API keys or try again later.")
  }
}

// Detect the language of the given text
export async function detectLanguage(text: string): Promise<string> {
  const prompt = `Detect the language of the following text and return ONLY the ISO 639-1 language code (e.g., "en" for English, "fr" for French, "de" for German, "es" for Spanish, "it" for Italian, "pt" for Portuguese, etc.).

Text: ${text.substring(0, 1000)}

Return ONLY the 2-letter language code, nothing else.`

  try {
    const code = await generateWithFallback(prompt, 10)
    const cleanCode = code
      .trim()
      .toLowerCase()
      .replace(/[^a-z]/g, "")
    return cleanCode || "en" // Default to English if detection fails
  } catch (error) {
    console.error("Language detection error:", error)
    return "en" // Default to English on error
  }
}

// Generate tailored CV content
export async function generateTailoredCV(
  userFacts: UserFacts,
  jobRequirements: JobRequirements,
  language = "en",
): Promise<string> {
  const verifiedFacts = verifyFacts(userFacts)

  const languageNames: Record<string, string> = {
    en: "English",
    fr: "French",
    de: "German",
    es: "Spanish",
    it: "Italian",
    pt: "Portuguese",
    nl: "Dutch",
    pl: "Polish",
    ru: "Russian",
    zh: "Chinese",
    ja: "Japanese",
    ko: "Korean",
    ar: "Arabic",
  }
  const languageName = languageNames[language] || "English"

  const prompt = `You are a professional CV writer. Create a tailored CV for the following job application.

CRITICAL REQUIREMENT - LANGUAGE:
Generate the ENTIRE CV in ${languageName} (${language.toUpperCase()}). All sections, headers, descriptions, and content MUST be in ${languageName}.

STRICT RULES - ANTI-HALLUCINATION GUARDRAILS:
1. ONLY use information provided in the user facts below
2. DO NOT invent, assume, or add any information not explicitly provided
3. DO NOT create fake companies, dates, or experiences
4. If information is missing, leave it blank or omit that section
5. Focus on highlighting relevant existing experience and skills

CRITICAL - EXPERIENCE TAILORING RULES:
For each work experience entry:
- Keep the COMPANY NAME exactly as provided (DO NOT CHANGE)
- Keep the JOB TITLE exactly as provided (DO NOT CHANGE)
- Keep the DATES exactly as provided (DO NOT CHANGE)
- REWORD the descriptions and achievements to align with the job requirements
- Highlight aspects of the experience that are most relevant to the target job
- Emphasize skills and accomplishments that match the job posting
- Use action verbs and quantifiable results when possible

USER FACTS (VERIFIED - USE ONLY THIS DATA):
Name: ${verifiedFacts.personalInfo.fullName}
Email: ${verifiedFacts.personalInfo.email}
Phone: ${verifiedFacts.personalInfo.phone || "Not provided"}
Location: ${verifiedFacts.personalInfo.location || "Not provided"}
LinkedIn: ${verifiedFacts.personalInfo.linkedinUrl || "Not provided"}
GitHub: ${verifiedFacts.personalInfo.githubUrl || "Not provided"}
Portfolio: ${verifiedFacts.personalInfo.portfolioUrl || "Not provided"}

Professional Summary: ${verifiedFacts.summary || "Not provided"}

Skills: ${verifiedFacts.skills.length > 0 ? verifiedFacts.skills.join(", ") : "Not provided"}

Experience: ${verifiedFacts.experience.length > 0 ? JSON.stringify(verifiedFacts.experience, null, 2) : "Not provided"}

Education: ${verifiedFacts.education.length > 0 ? JSON.stringify(verifiedFacts.education, null, 2) : "Not provided"}

Certifications: ${verifiedFacts.certifications.length > 0 ? JSON.stringify(verifiedFacts.certifications, null, 2) : "Not provided"}

JOB REQUIREMENTS:
Position: ${jobRequirements.title}
Company: ${jobRequirements.company}
Location: ${jobRequirements.location || "Not specified"}
Required Skills: ${jobRequirements.skills.join(", ")}

Job Description: ${jobRequirements.description}
Requirements: ${jobRequirements.requirements || "Not specified"}

Create a professional CV in ${languageName} that:
1. Includes ALL sections: Contact Info, Professional Summary, Skills, Experience, Education, Certifications
2. For each experience entry: Keep company name, job title, and dates UNCHANGED, but reword descriptions to align with the job requirements
3. Highlights the most relevant skills and experiences for this specific job
4. Uses professional formatting suitable for document generation
5. Emphasizes achievements and skills that match the job posting

IMPORTANT: 
- Write ALL content in ${languageName}. Section headers, descriptions, everything must be in ${languageName}.
- DO NOT omit Experience, Education, or Certifications sections if data is provided
- For experiences: ONLY reword descriptions, NEVER change company names, titles, or dates

Remember: ONLY use the provided verified facts. Do not add any information not explicitly stated above.`

  try {
    return await generateWithFallback(prompt, 2000)
  } catch (error) {
    console.error("CV generation error:", error)
    throw new Error("Failed to generate CV")
  }
}

// Generate tailored cover letter
export async function generateCoverLetter(
  userFacts: UserFacts,
  jobRequirements: JobRequirements,
  language = "en",
): Promise<string> {
  const verifiedFacts = verifyFacts(userFacts)

  const languageNames: Record<string, string> = {
    en: "English",
    fr: "French",
    de: "German",
    es: "Spanish",
    it: "Italian",
    pt: "Portuguese",
    nl: "Dutch",
    pl: "Polish",
    ru: "Russian",
    zh: "Chinese",
    ja: "Japanese",
    ko: "Korean",
    ar: "Arabic",
  }
  const languageName = languageNames[language] || "English"

  const prompt = `You are a professional cover letter writer. Create a compelling cover letter for the following job application.

CRITICAL REQUIREMENT - LANGUAGE:
Generate the ENTIRE cover letter in ${languageName} (${language.toUpperCase()}). All paragraphs, greetings, and content MUST be in ${languageName}.

STRICT RULES - ANTI-HALLUCINATION GUARDRAILS:
1. ONLY use information provided in the user facts below
2. DO NOT invent, assume, or add any information not explicitly provided
3. DO NOT create fake experiences, achievements, or qualifications
4. If specific information is missing, write in general terms about relevant areas
5. Focus on genuine enthusiasm and fit based on actual user background

USER FACTS (VERIFIED - USE ONLY THIS DATA):
Name: ${verifiedFacts.personalInfo.fullName}
Location: ${verifiedFacts.personalInfo.location || "Not provided"}
Professional Summary: ${verifiedFacts.summary || "Not provided"}
Skills: ${verifiedFacts.skills.length > 0 ? verifiedFacts.skills.join(", ") : "Not provided"}
Experience: ${verifiedFacts.experience.length > 0 ? JSON.stringify(verifiedFacts.experience) : "Not provided"}

JOB DETAILS:
Position: ${jobRequirements.title}
Company: ${jobRequirements.company}
Location: ${jobRequirements.location || "Not specified"}
Job Description: ${jobRequirements.description}
Requirements: ${jobRequirements.requirements || "Not specified"}

Write a professional cover letter in ${languageName} that:
1. Shows genuine interest in the specific role and company
2. Highlights relevant skills and experience from the verified user facts
3. Demonstrates understanding of the job requirements
4. Maintains professional tone throughout
5. Is concise and impactful (3-4 paragraphs)

Format as a complete cover letter with proper business letter structure in ${languageName}.

IMPORTANT: Write ALL content in ${languageName}. Greeting, body paragraphs, closing, everything must be in ${languageName}.

Remember: ONLY reference the provided verified facts. Do not invent any experiences or qualifications.`

  try {
    return await generateWithFallback(prompt, 1500)
  } catch (error) {
    console.error("Cover letter generation error:", error)
    throw new Error("Failed to generate cover letter")
  }
}

// Extract skills from job description for matching
export async function extractJobSkills(jobDescription: string, requirements?: string): Promise<string[]> {
  const prompt = `Extract the key technical skills, tools, and qualifications mentioned in this job posting. Return only a JSON array of strings.

Job Description: ${jobDescription}
Requirements: ${requirements || "Not specified"}

Return format: ["skill1", "skill2", "skill3"]

Focus on:
- Programming languages
- Frameworks and libraries
- Tools and platforms
- Certifications
- Specific technologies
- Methodologies (Agile, etc.)

Return only the JSON array, no other text.`

  try {
    const text = await generateWithFallback(prompt, 500)

    let cleanedText = text.trim()

    // Remove markdown code blocks if present (\`\`\`json ... \`\`\` or \`\`\` ... \`\`\`)
    if (cleanedText.startsWith("```")) {
      // Remove opening \`\`\`json or \`\`\`
      cleanedText = cleanedText.replace(/^```(?:json)?\n?/, "")
      // Remove closing \`\`\`
      cleanedText = cleanedText.replace(/\n?```$/, "")
      cleanedText = cleanedText.trim()
    }

    // Parse the JSON response
    const skills = JSON.parse(cleanedText)
    return Array.isArray(skills) ? skills : []
  } catch (error) {
    console.error("Skill extraction error:", error)
    return []
  }
}

// Extract structured data from CV text
export interface ExtractedCVData {
  personalInfo: {
    fullName: string
    email: string
    phone?: string
    location?: string
    linkedinUrl?: string
    githubUrl?: string
    portfolioUrl?: string
  }
  summary?: string
  skills: string[]
  experience: Array<{
    company: string
    position: string
    startDate: string
    endDate?: string
    description: string
    achievements?: string[]
  }>
  education: Array<{
    institution: string
    degree: string
    field: string
    startDate: string
    endDate?: string
    gpa?: string
  }>
  certifications: Array<{
    name: string
    issuer: string
    date: string
    expiryDate?: string
  }>
}

export async function extractCVData(cvText: string): Promise<ExtractedCVData> {
  const prompt = `You are a CV parsing expert. Extract structured information from the following CV text.

STRICT RULES:
1. ONLY extract information that is explicitly stated in the CV
2. DO NOT invent, assume, or add any information
3. If a field is not found, omit it or use empty array
4. Preserve exact dates, names, and details as written
5. Return valid JSON only

CRITICAL - JOB TITLE EXTRACTION:
- The "position" field MUST contain the exact job title/role as written in the CV
- Look for titles like: "Software Engineer", "Sales Manager", "Product Designer", "Data Analyst", etc.
- Extract the EXACT title, do not paraphrase or modify it
- If multiple titles are listed for one role, use the primary/main title

EXAMPLES OF CORRECT EXTRACTION:
- CV says "Senior Software Engineer at Google" → position: "Senior Software Engineer"
- CV says "Marketing Manager | Digital Strategy" → position: "Marketing Manager"
- CV says "Lead Data Scientist" → position: "Lead Data Scientist"

CV TEXT:
${cvText}

Extract and return a JSON object with this exact structure:
{
  "personalInfo": {
    "fullName": "string (exact name as written)",
    "email": "string (email address)",
    "phone": "string (phone number, optional)",
    "location": "string (city, country, optional)",
    "linkedinUrl": "string (LinkedIn profile URL, optional)",
    "githubUrl": "string (GitHub profile URL, optional)",
    "portfolioUrl": "string (portfolio/website URL, optional)"
  },
  "summary": "string (professional summary/objective section)",
  "skills": ["skill1", "skill2", "skill3", ...],
  "experience": [
    {
      "company": "string (company/organization name)",
      "position": "string (EXACT job title/role as written in CV)",
      "startDate": "string (e.g., 'Jan 2020', 'January 2020', or '2020')",
      "endDate": "string (e.g., 'Dec 2022' or 'Present' if current, optional)",
      "description": "string (main responsibilities and role description)",
      "achievements": ["achievement1", "achievement2", ...] (optional)
    }
  ],
  "education": [
    {
      "institution": "string (school/university name)",
      "degree": "string (degree type: Bachelor's, Master's, PhD, etc.)",
      "field": "string (field of study/major)",
      "startDate": "string (start year or date)",
      "endDate": "string (end year or date, optional)",
      "gpa": "string (GPA if mentioned, optional)"
    }
  ],
  "certifications": [
    {
      "name": "string (certification name)",
      "issuer": "string (issuing organization)",
      "date": "string (date obtained)",
      "expiryDate": "string (expiry date if applicable, optional)"
    }
  ]
}

IMPORTANT REMINDERS:
- Extract the EXACT job title for "position" field - do not modify or paraphrase
- Preserve all dates exactly as written
- Include all work experiences, education entries, and certifications found
- If information is missing, omit that field or use empty array

Return ONLY the JSON object, no other text or markdown.`

  try {
    const text = await generateWithFallback(prompt, 3000)

    let cleanedText = text.trim()

    // Remove markdown code blocks if present
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```(?:json)?\n?/, "")
      cleanedText = cleanedText.replace(/\n?```$/, "")
      cleanedText = cleanedText.trim()
    }

    const extractedData = JSON.parse(cleanedText)

    console.log("[v0] Extracted experience entries:")
    if (extractedData.experience && Array.isArray(extractedData.experience)) {
      extractedData.experience.forEach((exp: any, index: number) => {
        console.log(`[v0] Experience ${index + 1}:`, {
          company: exp.company,
          position: exp.position,
          startDate: exp.startDate,
          endDate: exp.endDate,
        })
      })
    }

    return extractedData as ExtractedCVData
  } catch (error) {
    console.error("CV extraction error:", error)
    throw new Error("Failed to extract CV data")
  }
}
