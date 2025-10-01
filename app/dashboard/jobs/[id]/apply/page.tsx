"use client"

import type { ReactElement } from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BrutalButton } from "@/components/ui/brutal-button"
import { BrutalCard, BrutalCardContent, BrutalCardHeader, BrutalCardTitle } from "@/components/ui/brutal-card"
import { BrutalBadge } from "@/components/ui/brutal-badge"
import type { JobPost } from "@/lib/database"
import { generateCoverLetterPDF, generateCVTextPDF } from "@/lib/pdf-export"

interface ApplyPageProps {
  params: Promise<{ id: string }>
}

export default function ApplyPage({ params }: ApplyPageProps): ReactElement {
  const [job, setJob] = useState<JobPost | null>(null)
  const [generatedCV, setGeneratedCV] = useState("")
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("")
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1) // 1: Review, 2: Generate, 3: Review & Submit
  const [profileWarning, setProfileWarning] = useState<string | null>(null)
  const [isDownloadingCV, setIsDownloadingCV] = useState(false)
  const [isDownloadingCL, setIsDownloadingCL] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const router = useRouter()

  const resolvedParams = params

  useEffect(() => {
    fetchJob()
    fetchUserProfile()
  }, [resolvedParams])

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${(await resolvedParams).id}`)
      if (response.ok) {
        const data = await response.json()
        setJob(data.job)
      }
    } catch (error) {
      console.error("Error fetching job:", error)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.profile)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const generateDocuments = async () => {
    if (!job) return

    setIsGenerating(true)
    setProfileWarning(null)
    try {
      const response = await fetch("/api/generate-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      })

      if (!response.ok) throw new Error("Generation failed")

      const data = await response.json()
      setGeneratedCV(data.cv)
      setGeneratedCoverLetter(data.coverLetter)
      setDetectedLanguage(data.language)

      if (data.userDataSummary) {
        const { hasExperience, hasEducation, skillsCount } = data.userDataSummary
        if (!hasExperience || !hasEducation || skillsCount === 0) {
          setProfileWarning(
            "⚠️ Votre profil est incomplet. Pour de meilleurs résultats, ajoutez votre expérience, éducation et compétences dans les paramètres.",
          )
        }
      }

      setStep(3)
    } catch (error) {
      console.error("Generation error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadCV = async () => {
    if (!generatedCV || !job) return
    setIsDownloadingCV(true)
    try {
      const filename = `CV_${job.company}_${job.title}.pdf`.replace(/[^a-zA-Z0-9_\-.]/g, "_")
      await generateCVTextPDF(generatedCV, filename)
    } catch (error) {
      console.error("Failed to download CV:", error)
    } finally {
      setIsDownloadingCV(false)
    }
  }

  const handleDownloadCoverLetter = async () => {
    if (!generatedCoverLetter || !job) return
    setIsDownloadingCL(true)
    try {
      const filename = `Cover_Letter_${job.company}_${job.title}.pdf`.replace(/[^a-zA-Z0-9_\-.]/g, "_")
      await generateCoverLetterPDF(generatedCoverLetter, filename)
    } catch (error) {
      console.error("Failed to download cover letter:", error)
    } finally {
      setIsDownloadingCL(false)
    }
  }

  const submitApplication = async () => {
    if (!job) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobPostId: job.id,
          tailoredCvContent: generatedCV,
          coverLetterContent: generatedCoverLetter,
        }),
      })

      if (!response.ok) throw new Error("Application submission failed")

      router.push("/dashboard?success=application-created")
    } catch (error) {
      console.error("Submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-2xl font-bold">Loading job details...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <BrutalBadge variant="primary" className="mb-4">
            STEP {step} OF 3
          </BrutalBadge>
          <h1 className="mb-4 text-3xl font-bold uppercase tracking-tight md:text-4xl">
            {step === 1 && "Review Job Details"}
            {step === 2 && "AI Generation in Progress"}
            {step === 3 && "Review & Submit Application"}
          </h1>
          <p className="text-muted-foreground">
            Applying for <span className="font-bold">{job.title}</span> at{" "}
            <span className="font-bold">{job.company}</span>
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <BrutalCard>
              <BrutalCardHeader>
                <BrutalCardTitle>Job Overview</BrutalCardTitle>
              </BrutalCardHeader>
              <BrutalCardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold">Position:</h3>
                    <p>{job.title}</p>
                  </div>
                  <div>
                    <h3 className="font-bold">Company:</h3>
                    <p>{job.company}</p>
                  </div>
                  {job.location && (
                    <div>
                      <h3 className="font-bold">Location:</h3>
                      <p>{job.location}</p>
                    </div>
                  )}
                  {job.salary_range && (
                    <div>
                      <h3 className="font-bold">Salary:</h3>
                      <p>{job.salary_range}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold">Description:</h3>
                    <p className="whitespace-pre-wrap">{job.description}</p>
                  </div>
                  {job.requirements && (
                    <div>
                      <h3 className="font-bold">Requirements:</h3>
                      <p className="whitespace-pre-wrap">{job.requirements}</p>
                    </div>
                  )}
                </div>
              </BrutalCardContent>
            </BrutalCard>

            <div className="flex justify-between">
              <BrutalButton variant="outline" onClick={() => router.back()}>
                BACK TO JOBS
              </BrutalButton>
              <BrutalButton onClick={() => setStep(2)}>GENERATE APPLICATION</BrutalButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <BrutalCard>
            <BrutalCardContent className="p-12 text-center">
              <div className="mb-6">
                {isGenerating && (
                  <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                )}
                <h3 className="mb-2 text-xl font-bold uppercase">
                  {isGenerating ? "AI is Working" : "Ready to Generate"}
                </h3>
                <p className="text-muted-foreground">
                  {isGenerating
                    ? "Our AI is analyzing the job requirements and generating your tailored CV and cover letter..."
                    : "Click the button below to start generating your tailored application documents"}
                </p>
              </div>

              {!isGenerating && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>✓ Analyzing job requirements</p>
                  <p>✓ Matching your skills and experience</p>
                  <p>✓ Generating tailored CV</p>
                  <p>✓ Writing personalized cover letter</p>
                  <p>✓ Applying anti-hallucination guardrails</p>
                </div>
              )}

              <BrutalButton className="mt-8" onClick={generateDocuments} disabled={isGenerating}>
                {isGenerating ? "GENERATING..." : "START GENERATION"}
              </BrutalButton>
            </BrutalCardContent>
          </BrutalCard>
        )}

        {step === 3 && (
          <div className="space-y-6">
            {detectedLanguage && (
              <BrutalCard className="border-blue-500 bg-blue-50">
                <BrutalCardContent className="p-4">
                  <p className="text-sm font-bold text-blue-800">
                    ✓ Documents générés en{" "}
                    {detectedLanguage === "fr"
                      ? "français"
                      : detectedLanguage === "en"
                        ? "anglais"
                        : detectedLanguage === "de"
                          ? "allemand"
                          : detectedLanguage === "es"
                            ? "espagnol"
                            : detectedLanguage}{" "}
                    (langue de l'annonce détectée)
                  </p>
                </BrutalCardContent>
              </BrutalCard>
            )}

            {profileWarning && (
              <BrutalCard className="border-yellow-500 bg-yellow-50">
                <BrutalCardContent className="p-4">
                  <p className="text-sm font-bold text-yellow-800">{profileWarning}</p>
                </BrutalCardContent>
              </BrutalCard>
            )}

            <BrutalCard>
              <BrutalCardHeader>
                <BrutalCardTitle>Generated CV</BrutalCardTitle>
              </BrutalCardHeader>
              <BrutalCardContent>
                <div className="border-4 border-black bg-muted p-4">
                  <pre className="whitespace-pre-wrap text-sm">{generatedCV}</pre>
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
                <BrutalCardTitle>Generated Cover Letter</BrutalCardTitle>
              </BrutalCardHeader>
              <BrutalCardContent>
                <div className="border-4 border-black bg-muted p-4">
                  <pre className="whitespace-pre-wrap text-sm">{generatedCoverLetter}</pre>
                </div>
                <div className="mt-4">
                  <BrutalButton
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadCoverLetter}
                    disabled={isDownloadingCL}
                  >
                    {isDownloadingCL ? "GENERATING PDF..." : "DOWNLOAD COVER LETTER"}
                  </BrutalButton>
                </div>
              </BrutalCardContent>
            </BrutalCard>

            <div className="flex justify-between">
              <BrutalButton variant="outline" onClick={() => setStep(2)}>
                REGENERATE
              </BrutalButton>
              <BrutalButton onClick={submitApplication} disabled={isSubmitting}>
                {isSubmitting ? "SUBMITTING..." : "SUBMIT APPLICATION"}
              </BrutalButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
