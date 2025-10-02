// Simple session-based authentication for the MVP
// In production, you'd want to use a more robust solution like NextAuth.js

import { cookies } from "next/headers"
import { sql } from "./database"
import type { Profile } from "./database"

export async function getCurrentUser(): Promise<Profile | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    console.log("[v0] Checking session, session_id:", sessionId)

    if (!sessionId) {
      console.log("[v0] No session_id cookie found")
      return null
    }

    // For MVP, we'll use email as session identifier
    // In production, implement proper session management
    const result = await sql`
      SELECT * FROM profiles 
      WHERE email = ${sessionId}
      LIMIT 1
    `

    console.log("[v0] User lookup result:", result.length > 0 ? "User found" : "User not found")

    if (result.length > 0) {
      console.log("[v0] User email:", result[0].email)
    }

    return (result[0] as Profile) || null
  } catch (error) {
    console.error("[v0] Error getting current user:", error)
    return null
  }
}

export async function createOrUpdateProfile(profileData: Partial<Profile>): Promise<Profile> {
  const {
    email,
    full_name,
    phone,
    location,
    linkedin_url,
    github_url,
    portfolio_url,
    summary,
    skills,
    experience,
    education,
    certifications,
    cv_file_url,
  } = profileData

  // Convert arrays/objects to JSON strings for JSONB columns
  const experienceJson = experience ? JSON.stringify(experience) : null
  const educationJson = education ? JSON.stringify(education) : null
  const certificationsJson = certifications ? JSON.stringify(certifications) : null

  // Handle skills - convert to array if it's a string
  let skillsArray = skills
  if (typeof skills === "string") {
    // Split comma-separated string into array
    skillsArray = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  }

  const result = await sql`
    INSERT INTO profiles (
      email, full_name, phone, location, linkedin_url, github_url, 
      portfolio_url, summary, skills, experience, education, 
      certifications, cv_file_url
    )
    VALUES (
      ${email}, ${full_name}, ${phone}, ${location}, ${linkedin_url}, 
      ${github_url}, ${portfolio_url}, ${summary}, ${skillsArray}, 
      ${experienceJson}, ${educationJson}, ${certificationsJson}, ${cv_file_url}
    )
    ON CONFLICT (email) 
    DO UPDATE SET
      full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone,
      location = EXCLUDED.location,
      linkedin_url = EXCLUDED.linkedin_url,
      github_url = EXCLUDED.github_url,
      portfolio_url = EXCLUDED.portfolio_url,
      summary = EXCLUDED.summary,
      skills = EXCLUDED.skills,
      experience = EXCLUDED.experience,
      education = EXCLUDED.education,
      certifications = EXCLUDED.certifications,
      cv_file_url = EXCLUDED.cv_file_url,
      updated_at = NOW()
    RETURNING *
  `

  return result[0] as Profile
}

export async function setUserSession(email: string) {
  const cookieStore = await cookies()
  cookieStore.set("session_id", email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearUserSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session_id")
}
