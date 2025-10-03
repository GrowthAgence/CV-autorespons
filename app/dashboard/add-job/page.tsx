"use client"

import type React from "react"
declare global {
  interface Window {
    chrome?: any
  }
}

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BrutalButton } from "@/components/ui/brutal-button"
import { BrutalCard, BrutalCardContent, BrutalCardHeader, BrutalCardTitle } from "@/components/ui/brutal-card"
import { BrutalInput } from "@/components/ui/brutal-input"
import { BrutalBadge } from "@/components/ui/brutal-badge"

export default function AddJobPage() {
  const [pastedContent, setPastedContent] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    jobType: "",
    salaryRange: "",
    description: "",
    requirements: "",
    benefits: "",
    applicationUrl: "",
    sourceUrl: "",
    deadline: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("fromExtension") === "true") {
      extractJobFromExtension()
    }
  }, [])

  const extractJobFromExtension = async () => {
    setIsExtracting(true)

    try {
      if (typeof window !== "undefined" && window.chrome?.storage) {
        window.chrome.storage.local.get(["pendingJob"], async (result: any) => {
          if (result.pendingJob) {
            console.log("[v0] Processing job data with AI:", result.pendingJob)

            const response = await fetch("/api/jobs/extract", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                url: result.pendingJob.url,
                html: result.pendingJob.html,
                text: result.pendingJob.text,
              }),
            })

            if (response.ok) {
              const data = await response.json()
              console.log("[v0] AI extraction successful:", data)

              window.chrome.storage.local.remove(["pendingJob"])

              router.push("/dashboard")
            } else {
              console.error("[v0] AI extraction failed")
              alert("Failed to extract job data. Please try again or enter manually.")
            }
          }
          setIsExtracting(false)
        })
      } else {
        console.log("[v0] Chrome extension API not available")
        setIsExtracting(false)
      }
    } catch (error) {
      console.error("[v0] Error extracting job:", error)
      alert("Error processing job data. Please enter manually.")
      setIsExtracting(false)
    }
  }

  const handleExtractFromPaste = async () => {
    if (!pastedContent.trim()) {
      alert("Please paste job posting content first")
      return
    }

    setIsExtracting(true)

    try {
      console.log("[v0] Sending content to AI for extraction")

      const response = await fetch("/api/jobs/extract-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: pastedContent }),
      })

      if (!response.ok) {
        const error = await response.json()
        if (error.error?.includes("credit card") || error.error?.includes("AI Gateway")) {
          alert(
            "⚠️ AI extraction requires an AI integration.\n\n" +
              "Please add a free AI integration:\n" +
              "1. Click the ⚙️ Settings icon (top right)\n" +
              "2. Go to 'Integrations'\n" +
              "3. Add 'Groq' (free) or another AI provider\n\n" +
              "Or manually fill the form below.",
          )
        } else {
          throw new Error(error.error || "Failed to extract job data")
        }
        setIsExtracting(false)
        return
      }

      const result = await response.json()
      console.log("[v0] AI extraction successful:", result.data)

      setFormData({
        title: result.data.title || "",
        company: result.data.company || "",
        location: result.data.location || "",
        jobType: result.data.jobType || "",
        salaryRange: result.data.salaryRange || "",
        description: result.data.description || "",
        requirements: result.data.requirements || "",
        benefits: result.data.benefits || "",
        applicationUrl: result.data.applicationUrl || "",
        sourceUrl: result.data.sourceUrl || "",
        deadline: "",
      })

      setPastedContent("")

      alert("✅ Job data extracted! Review and edit the fields below, then save.")
    } catch (error: any) {
      console.error("[v0] Error extracting job:", error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsExtracting(false)
    }
  }

  const validateUrl = (url: string): boolean => {
    if (!url) return true
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }

    if ((field === "applicationUrl" || field === "sourceUrl") && value) {
      if (!validateUrl(value)) {
        setErrors((prev) => ({ ...prev, [field]: "Please enter a valid URL (e.g., https://example.com)" }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Form submitted with data:", formData)

    const newErrors: Record<string, string> = {}

    if (!formData.title) newErrors.title = "Job title is required"
    if (!formData.company) newErrors.company = "Company is required"
    if (!formData.description) newErrors.description = "Description is required"

    if (formData.applicationUrl && !validateUrl(formData.applicationUrl)) {
      newErrors.applicationUrl = "Please enter a valid URL"
    }
    if (formData.sourceUrl && !validateUrl(formData.sourceUrl)) {
      newErrors.sourceUrl = "Please enter a valid URL"
    }

    if (Object.keys(newErrors).length > 0) {
      console.log("[v0] Validation errors:", newErrors)
      setErrors(newErrors)
      return
    }

    console.log("[v0] Validation passed, saving job...")
    setIsLoading(true)

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] API error:", errorData)
        throw new Error("Failed to create job")
      }

      const result = await response.json()
      console.log("[v0] Job created successfully:", result)

      router.push("/dashboard")
    } catch (error) {
      console.error("[v0] Job creation error:", error)
      alert("Failed to save job. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isExtracting) {
    return (
      <div className="min-h-screen bg-background px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <BrutalCard>
            <BrutalCardContent className="py-12 text-center">
              <div className="mb-4 text-6xl">🤖</div>
              <h2 className="mb-2 text-2xl font-bold uppercase">AI Extraction in Progress</h2>
              <p className="text-muted-foreground">Analyzing job posting with AI...</p>
            </BrutalCardContent>
          </BrutalCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <BrutalBadge variant="primary" className="mb-4">
            ADD JOB
          </BrutalBadge>
          <h1 className="mb-4 text-3xl font-bold uppercase tracking-tight md:text-4xl">Add Job Posting</h1>
          <p className="text-muted-foreground">Paste job content and let AI extract the details</p>
        </div>

        <BrutalCard className="mb-6">
          <BrutalCardHeader>
            <BrutalCardTitle>🤖 Paste Job Posting (AI Extraction)</BrutalCardTitle>
          </BrutalCardHeader>
          <BrutalCardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Copy the entire job posting from any website and paste it below. AI will automatically extract and fill
              all the fields.
            </p>
            <textarea
              className="border-4 border-black bg-input px-4 py-3 font-medium focus:outline-none focus:ring-4 focus:ring-ring min-h-[200px] w-full resize-y"
              value={pastedContent}
              onChange={(e) => setPastedContent(e.target.value)}
              placeholder="Paste the complete job posting here (title, company, description, requirements, etc.)..."
              disabled={isExtracting}
            />
            <div className="flex justify-end">
              <BrutalButton onClick={handleExtractFromPaste} disabled={isExtracting || !pastedContent.trim()}>
                {isExtracting ? "🤖 EXTRACTING..." : "✨ EXTRACT WITH AI"}
              </BrutalButton>
            </div>
          </BrutalCardContent>
        </BrutalCard>

        <form onSubmit={handleSubmit}>
          <BrutalCard>
            <BrutalCardHeader>
              <BrutalCardTitle>Job Details</BrutalCardTitle>
            </BrutalCardHeader>
            <BrutalCardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide">Job Title *</label>
                  <BrutalInput
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Senior Software Engineer"
                    required
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600 font-bold">{errors.title}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide">Company *</label>
                  <BrutalInput
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    placeholder="Google"
                    required
                  />
                  {errors.company && <p className="mt-1 text-sm text-red-600 font-bold">{errors.company}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide">Location</label>
                  <BrutalInput
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide">Job Type</label>
                  <select
                    className="border-4 border-black bg-input px-4 py-3 font-medium focus:outline-none focus:ring-4 focus:ring-ring w-full"
                    value={formData.jobType}
                    onChange={(e) => handleInputChange("jobType", e.target.value)}
                  >
                    <option value="">Select job type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide">Salary Range</label>
                  <BrutalInput
                    value={formData.salaryRange}
                    onChange={(e) => handleInputChange("salaryRange", e.target.value)}
                    placeholder="$120k - $180k"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide">Application Deadline</label>
                  <BrutalInput
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange("deadline", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide">Job Description *</label>
                <textarea
                  className="border-4 border-black bg-input px-4 py-3 font-medium focus:outline-none focus:ring-4 focus:ring-ring min-h-[120px] w-full resize-none"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Detailed job description..."
                  required
                />
                {errors.description && <p className="mt-1 text-sm text-red-600 font-bold">{errors.description}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide">Requirements</label>
                <textarea
                  className="border-4 border-black bg-input px-4 py-3 font-medium focus:outline-none focus:ring-4 focus:ring-ring min-h-[100px] w-full resize-none"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange("requirements", e.target.value)}
                  placeholder="Required skills and qualifications..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide">Benefits</label>
                <textarea
                  className="border-4 border-black bg-input px-4 py-3 font-medium focus:outline-none focus:ring-4 focus:ring-ring min-h-[80px] w-full resize-none"
                  value={formData.benefits}
                  onChange={(e) => handleInputChange("benefits", e.target.value)}
                  placeholder="Benefits and perks..."
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide">Application URL</label>
                  <BrutalInput
                    type="url"
                    value={formData.applicationUrl}
                    onChange={(e) => handleInputChange("applicationUrl", e.target.value)}
                    placeholder="https://company.com/apply"
                  />
                  {errors.applicationUrl && (
                    <p className="mt-1 text-sm text-red-600 font-bold">{errors.applicationUrl}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide">Source URL</label>
                  <BrutalInput
                    type="url"
                    value={formData.sourceUrl}
                    onChange={(e) => handleInputChange("sourceUrl", e.target.value)}
                    placeholder="https://linkedin.com/jobs/123"
                  />
                  {errors.sourceUrl && <p className="mt-1 text-sm text-red-600 font-bold">{errors.sourceUrl}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <BrutalButton type="button" variant="outline" onClick={() => router.back()}>
                  CANCEL
                </BrutalButton>
                <BrutalButton
                  type="submit"
                  disabled={isLoading || !formData.title || !formData.company || !formData.description}
                >
                  {isLoading ? "SAVING..." : "SAVE JOB"}
                </BrutalButton>
              </div>
            </BrutalCardContent>
          </BrutalCard>
        </form>
      </div>
    </div>
  )
}
