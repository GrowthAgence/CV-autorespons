import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Database types based on our schema
export interface Profile {
  id: string
  email: string
  full_name: string
  phone?: string
  location?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  summary?: string
  skills?: string[]
  experience?: any
  education?: any
  certifications?: any
  cv_file_url?: string
  created_at: Date
  updated_at: Date
}

export interface JobPost {
  id: string
  user_id: string
  title: string
  company: string
  location?: string
  job_type?: string
  salary_range?: string
  description: string
  requirements?: string
  benefits?: string
  application_url?: string
  source_url?: string
  posted_date?: Date
  deadline?: Date
  status: "active" | "expired" | "filled"
  raw_html?: string
  created_at: Date
  updated_at: Date
}

export interface Application {
  id: string
  user_id: string
  job_post_id: string
  status: "draft" | "submitted" | "interview" | "rejected" | "accepted"
  tailored_cv_content?: string
  cover_letter_content?: string
  cv_file_url?: string
  cover_letter_file_url?: string
  application_date?: Date
  notes?: string
  interview_date?: Date
  follow_up_date?: Date
  created_at: Date
  updated_at: Date
}

export interface Email {
  id: string
  application_id: string
  email_type: string
  subject: string
  content: string
  recipient_email: string
  sent_at?: Date
  status: "draft" | "sent" | "failed"
  gmail_message_id?: string
  created_at: Date
  updated_at: Date
}
