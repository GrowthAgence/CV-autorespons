"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BrutalCard, BrutalCardContent, BrutalCardHeader, BrutalCardTitle } from "@/components/ui/brutal-card"
import { BrutalButton } from "@/components/ui/brutal-button"
import { BrutalBadge } from "@/components/ui/brutal-badge"
import { BrutalInput } from "@/components/ui/brutal-input"
import { generateATSFriendlyPDF, generateCoverLetterPDF } from "@/lib/pdf-export"

interface ApplicationDetailsProps {
  application: any
  userProfile?: any
}

export function ApplicationDetails({ application, userProfile }: ApplicationDetailsProps) {
  const [notes, setNotes] = useState(application.notes || "")
  const [interviewDate, setInterviewDate] = useState(
    application.interview_date ? new Date(application.interview_date).toISOString().split("T")[0] : "",
  )
  const [followUpDate, setFollowUpDate] = useState(
    application.follow_up_date ? new Date(application.follow_up_date).toISOString().split("T")[0] : "",
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isDownloadingCV, setIsDownloadingCV] = useState(false)
  const [isDownloadingCL, setIsDownloadingCL] = useState(false)

  useEffect(() => {
    console.log("[v0] ApplicationDetails component mounted")
    console.log("[v0] Application data:", {
      id: application.id,
      title: application.title,
      company: application.company,
      hasCVContent: !!application.tailored_cv_content,
      hasCoverLetter: !!application.cover_letter_content,
    })
    console.log("[v0] User profile data:", {
      hasProfile: !!userProfile,
      email: userProfile?.email,
      fullName: userProfile?.full_name,
      hasExperience: !!userProfile?.experience,
      hasEducation: !!userProfile?.education,
    })
  }, [application, userProfile])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary"
      case "submitted":
        return "primary"
      case "interview":
        return "accent"
      case "accepted":
        return "success"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  const saveUpdates = async () => {
    setIsSaving(true)
    try {
      await fetch(`/api/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes,
          interview_date: interviewDate || null,
          follow_up_date: followUpDate || null,
        }),
      })
      window.location.reload()
    } catch (error) {
      console.error("Failed to save updates:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadCV = async () => {
    setIsDownloadingCV(true)
    try {
      // Fetch user profile if not provided
      let profile = userProfile
      if (!profile) {
        const response = await fetch("/api/profile")
        if (response.ok) {
          const data = await response.json()
          profile = data.profile
        }
      }

      if (!profile) {
        alert("Unable to load profile data")
        return
      }

      // Prepare CV data in the format expected by the PDF generator
      const cvData = {
        personalInfo: {
          fullName: profile.full_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          location: profile.location || "",
          linkedinUrl: profile.linkedin_url || "",
          githubUrl: profile.github_url || "",
          portfolioUrl: profile.portfolio_url || "",
        },
        summary: profile.summary || "",
        skills: profile.skills || [],
        experience: profile.experience || [],
        education: profile.education || [],
        certifications: profile.certifications || [],
      }

      const filename = `CV_${application.company}_${application.title}.pdf`.replace(/[^a-zA-Z0-9_\-.]/g, "_")
      await generateATSFriendlyPDF(cvData, filename)
    } catch (error) {
      console.error("Failed to download CV:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsDownloadingCV(false)
    }
  }

  const handleDownloadCoverLetter = async () => {
    setIsDownloadingCL(true)
    try {
      const filename = `Cover_Letter_${application.company}_${application.title}.pdf`.replace(/[^a-zA-Z0-9_\-.]/g, "_")
      await generateCoverLetterPDF(application.cover_letter_content, filename)
    } catch (error) {
      console.error("Failed to download cover letter:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsDownloadingCL(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold uppercase tracking-tight">{application.title}</h1>
          <p className="text-lg font-bold text-secondary">{application.company}</p>
          <p className="text-muted-foreground">{application.location}</p>
        </div>
        <BrutalBadge variant={getStatusColor(application.status) as any} className="text-lg">
          {application.status.toUpperCase()}
        </BrutalBadge>
      </div>

      {/* Application Overview */}
      <BrutalCard>
        <BrutalCardHeader>
          <BrutalCardTitle>Application Overview</BrutalCardTitle>
        </BrutalCardHeader>
        <BrutalCardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-bold">Applied Date:</h4>
              <p>{new Date(application.created_at).toLocaleDateString()}</p>
            </div>
            {application.salary_range && (
              <div>
                <h4 className="font-bold">Salary Range:</h4>
                <p>{application.salary_range}</p>
              </div>
            )}
            {application.application_url && (
              <div>
                <h4 className="font-bold">Application URL:</h4>
                <a
                  href={application.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View Original Posting
                </a>
              </div>
            )}
            {application.source_url && (
              <div>
                <h4 className="font-bold">Source:</h4>
                <a
                  href={application.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View Source
                </a>
              </div>
            )}
          </div>
        </BrutalCardContent>
      </BrutalCard>

      {/* Generated Documents */}
      <div className="grid gap-6 md:grid-cols-2">
        <BrutalCard>
          <BrutalCardHeader>
            <BrutalCardTitle>Generated CV</BrutalCardTitle>
          </BrutalCardHeader>
          <BrutalCardContent>
            <div className="max-h-96 overflow-y-auto border-4 border-black bg-muted p-4">
              <pre className="whitespace-pre-wrap text-sm">{application.tailored_cv_content}</pre>
            </div>
            <div className="mt-4">
              <BrutalButton size="sm" variant="outline" onClick={handleDownloadCV} disabled={isDownloadingCV}>
                {isDownloadingCV ? "GENERATING PDF..." : "DOWNLOAD CV (ATS-FRIENDLY)"}
              </BrutalButton>
            </div>
          </BrutalCardContent>
        </BrutalCard>

        <BrutalCard>
          <BrutalCardHeader>
            <BrutalCardTitle>Cover Letter</BrutalCardTitle>
          </BrutalCardHeader>
          <BrutalCardContent>
            <div className="max-h-96 overflow-y-auto border-4 border-black bg-muted p-4">
              <pre className="whitespace-pre-wrap text-sm">{application.cover_letter_content}</pre>
            </div>
            <div className="mt-4">
              <BrutalButton size="sm" variant="outline" onClick={handleDownloadCoverLetter} disabled={isDownloadingCL}>
                {isDownloadingCL ? "GENERATING PDF..." : "DOWNLOAD COVER LETTER"}
              </BrutalButton>
            </div>
          </BrutalCardContent>
        </BrutalCard>
      </div>

      {/* Application Management */}
      <BrutalCard>
        <BrutalCardHeader>
          <BrutalCardTitle>Application Management</BrutalCardTitle>
        </BrutalCardHeader>
        <BrutalCardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold uppercase tracking-wide">Interview Date</label>
              <BrutalInput type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold uppercase tracking-wide">Follow-up Date</label>
              <BrutalInput type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold uppercase tracking-wide">Notes</label>
            <textarea
              className="min-h-[120px] w-full resize-none border-4 border-black bg-input px-4 py-3 font-medium focus:outline-none focus:ring-4 focus:ring-ring"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this application, interview feedback, follow-up actions, etc."
            />
          </div>

          <div className="flex justify-between">
            <BrutalButton variant="outline" asChild>
              <Link href="/dashboard/applications">BACK TO APPLICATIONS</Link>
            </BrutalButton>
            <BrutalButton onClick={saveUpdates} disabled={isSaving}>
              {isSaving ? "SAVING..." : "SAVE UPDATES"}
            </BrutalButton>
          </div>
        </BrutalCardContent>
      </BrutalCard>
    </div>
  )
}
