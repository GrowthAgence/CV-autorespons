"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BrutalButton } from "@/components/ui/brutal-button"
import { BrutalCard, BrutalCardContent } from "@/components/ui/brutal-card"
import { BrutalInput } from "@/components/ui/brutal-input"
import { BrutalBadge } from "@/components/ui/brutal-badge"

interface ExtractedCVData {
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

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    location: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    summary: "",
    skills: "",
  })
  const [structuredData, setStructuredData] = useState<{
    experience: any[]
    education: any[]
    certifications: any[]
  }>({
    experience: [],
    education: [],
    certifications: [],
  })
  const [cvText, setCvText] = useState("")
  const [uploadMethod, setUploadMethod] = useState<"text" | "pdf">("pdf")
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [dataExtracted, setDataExtracted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateUrl = (url: string): boolean => {
    if (!url) return true // Optional field
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true // Optional field
    const phoneRegex = /^[\d\s\-+()]+$/
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }

    // Validate on blur
    if (field === "email" && value) {
      if (!validateEmail(value)) {
        setErrors((prev) => ({ ...prev, email: "Email must contain @ and a domain (e.g., user@example.com)" }))
      }
    } else if ((field === "linkedinUrl" || field === "githubUrl" || field === "portfolioUrl") && value) {
      if (!validateUrl(value)) {
        setErrors((prev) => ({ ...prev, [field]: "Please enter a valid URL (e.g., https://example.com)" }))
      }
    } else if (field === "phone" && value) {
      if (!validatePhone(value)) {
        setErrors((prev) => ({ ...prev, phone: "Please enter a valid phone number" }))
      }
    }
  }

  const handlePDFUpload = async (file: File) => {
    if (!file.type.includes("pdf")) {
      setErrors({ cv: "Please upload a PDF file" })
      return
    }

    setIsExtracting(true)
    setErrors({})
    setUploadedFileName(file.name)

    try {
      console.log("[v0] Processing PDF file:", file.name)

      // Use unpdf to extract text from PDF
      const { extractText } = await import("unpdf")
      const arrayBuffer = await file.arrayBuffer()
      const { text } = await extractText(new Uint8Array(arrayBuffer), { mergePages: true })

      console.log("[v0] Extracted text from PDF:", text.substring(0, 200) + "...")

      if (!text || text.trim().length < 50) {
        throw new Error("Could not extract enough text from PDF. Please try copying and pasting the text instead.")
      }

      await extractCVData(text)
    } catch (error: any) {
      console.error("[v0] PDF extraction error:", error)
      setErrors({ cv: error.message || "Failed to extract PDF data. Please try copying and pasting the text instead." })
      setUploadedFileName("")
    } finally {
      setIsExtracting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handlePDFUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handlePDFUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleTextExtraction = async () => {
    if (!cvText || cvText.trim().length < 50) {
      setErrors({ cv: "Please paste your CV text (at least 50 characters)" })
      return
    }

    setIsExtracting(true)
    setErrors({})

    try {
      await extractCVData(cvText)
    } catch (error: any) {
      console.error("[v0] CV extraction error:", error)
      setErrors({ cv: error.message || "Failed to extract CV data. Please try again or fill manually." })
    } finally {
      setIsExtracting(false)
    }
  }

  const extractCVData = async (text: string) => {
    console.log("[v0] Sending text to AI for extraction...")

    // Send extracted text to API for AI processing
    const response = await fetch("/api/extract-cv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to extract CV data")
    }

    const { data } = await response.json()
    console.log("[v0] Extracted CV data:", data)
    console.log("[v0] Personal info extracted:", {
      email: data.personalInfo?.email,
      fullName: data.personalInfo?.fullName,
      phone: data.personalInfo?.phone,
      location: data.personalInfo?.location,
    })

    const newFormData = {
      email: data.personalInfo?.email || "",
      fullName: data.personalInfo?.fullName || "",
      phone: data.personalInfo?.phone || "",
      location: data.personalInfo?.location || "",
      linkedinUrl: data.personalInfo?.linkedinUrl || "",
      githubUrl: data.personalInfo?.githubUrl || "",
      portfolioUrl: data.personalInfo?.portfolioUrl || "",
      summary: data.summary || "",
      skills: Array.isArray(data.skills) ? data.skills.join(", ") : "",
    }

    console.log("[v0] Setting formData to:", newFormData)
    setFormData(newFormData)

    const mappedExperience = (data.experience || []).map((exp: any) => ({
      ...exp,
      title: exp.position || exp.title || "", // Use position if available, fallback to title
    }))

    setStructuredData({
      experience: mappedExperience,
      education: data.education || [],
      certifications: data.certifications || [],
    })

    setDataExtracted(true)

    console.log("[v0] Form pre-filled with extracted data")
    console.log("[v0] Current formData after setting:", newFormData)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] Creating profile with data:", {
        ...formData,
        ...structuredData,
      })

      const profileResponse = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills.split(",").map((s) => s.trim()),
          experience: structuredData.experience,
          education: structuredData.education,
          certifications: structuredData.certifications,
        }),
      })

      if (!profileResponse.ok) throw new Error("Failed to create profile")

      // Set session
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      })

      console.log("[v0] Profile created successfully, redirecting to dashboard")
      router.push("/dashboard")
    } catch (error) {
      console.error("Onboarding error:", error)
      setErrors({ submit: "Failed to create profile. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    const newErrors: Record<string, string> = {}

    if (step === 2) {
      if (!formData.email) {
        newErrors.email = "Email is required"
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "Email must contain @ and a domain (e.g., user@example.com)"
      }

      if (!formData.fullName) {
        newErrors.fullName = "Full name is required"
      }

      if (formData.phone && !validatePhone(formData.phone)) {
        newErrors.phone = "Please enter a valid phone number"
      }
    } else if (step === 4) {
      if (formData.linkedinUrl && !validateUrl(formData.linkedinUrl)) {
        newErrors.linkedinUrl = "Please enter a valid URL"
      }
      if (formData.githubUrl && !validateUrl(formData.githubUrl)) {
        newErrors.githubUrl = "Please enter a valid URL"
      }
      if (formData.portfolioUrl && !validateUrl(formData.portfolioUrl)) {
        newErrors.portfolioUrl = "Please enter a valid URL"
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setStep(step + 1)
  }

  const prevStep = () => setStep(step - 1)

  const skipToManualEntry = () => {
    setStep(2)
  }

  const updateExperience = (index: number, field: string, value: string) => {
    const updated = [...structuredData.experience]
    updated[index] = { ...updated[index], [field]: value }
    setStructuredData({ ...structuredData, experience: updated })
  }

  const removeExperience = (index: number) => {
    setStructuredData({
      ...structuredData,
      experience: structuredData.experience.filter((_, i) => i !== index),
    })
  }

  const addExperience = () => {
    setStructuredData({
      ...structuredData,
      experience: [
        ...structuredData.experience,
        { company: "", title: "", startDate: "", endDate: "", description: "" },
      ],
    })
  }

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...structuredData.education]
    updated[index] = { ...updated[index], [field]: value }
    setStructuredData({ ...structuredData, education: updated })
  }

  const removeEducation = (index: number) => {
    setStructuredData({
      ...structuredData,
      education: structuredData.education.filter((_, i) => i !== index),
    })
  }

  const addEducation = () => {
    setStructuredData({
      ...structuredData,
      education: [...structuredData.education, { school: "", degree: "", startDate: "", endDate: "" }],
    })
  }

  const updateCertification = (index: number, field: string, value: string) => {
    const updated = [...structuredData.certifications]
    updated[index] = { ...updated[index], [field]: value }
    setStructuredData({ ...structuredData, certifications: updated })
  }

  const removeCertification = (index: number) => {
    setStructuredData({
      ...structuredData,
      certifications: structuredData.certifications.filter((_, i) => i !== index),
    })
  }

  const addCertification = () => {
    setStructuredData({
      ...structuredData,
      certifications: [...structuredData.certifications, { name: "", issuer: "", date: "" }],
    })
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <BrutalBadge variant="primary" className="mb-4">
            STEP {step} OF 4
          </BrutalBadge>
          <h1 className="mb-4 text-3xl font-bold uppercase tracking-tight md:text-4xl">
            {step === 1 && "Upload Your CV"}
            {step === 2 && "Verify Basic Information"}
            {step === 3 && "Verify Experience & Education"}
            {step === 4 && "Professional Details"}
          </h1>
          <p className="text-muted-foreground">
            {step === 1 && "AI will extract all your information automatically"}
            {step === 2 && "Review and edit your contact information"}
            {step === 3 && "Review and edit your experience, education, and certifications"}
            {step === 4 && "Add your professional links and summary"}
          </p>
        </div>

        <BrutalCard>
          <BrutalCardContent className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mb-6">
                    <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center border-4 border-black bg-gradient-to-br from-yellow-400 to-orange-400 shadow-[8px_8px_0px_#000000]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-16 w-16 text-black"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-2xl font-bold uppercase">Upload Your CV</h3>
                    <p className="text-muted-foreground">
                      Our AI will automatically extract your contact info, experience, education, skills, and more
                    </p>
                  </div>

                  <div className="border-4 border-black bg-gradient-to-br from-cyan-100 to-blue-100 p-6 shadow-[6px_6px_0px_#000000]">
                    {uploadMethod === "pdf" ? (
                      <div className="space-y-4">
                        <div
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          className={`relative min-h-[300px] cursor-pointer border-4 border-dashed ${
                            isDragging ? "border-purple-500 bg-purple-50" : "border-black bg-white"
                          } p-8 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] transition-colors hover:bg-gray-50`}
                        >
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            disabled={isExtracting}
                            className="absolute inset-0 cursor-pointer opacity-0"
                            id="pdf-upload"
                          />
                          <label
                            htmlFor="pdf-upload"
                            className="flex h-full cursor-pointer flex-col items-center justify-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mb-4 h-16 w-16 text-purple-500"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <p className="mb-2 text-lg font-bold uppercase">
                              {uploadedFileName || "Drop your PDF here or click to browse"}
                            </p>
                            <p className="text-sm text-muted-foreground">Supports PDF files up to 10MB</p>
                          </label>
                        </div>
                        <div className="border-4 border-black bg-yellow-300 p-3 shadow-[4px_4px_0px_#000000]">
                          <p className="text-sm font-bold text-black">
                            💡 Tip: Drag and drop your CV PDF file or click to select from your computer
                          </p>
                        </div>

                        <div className="pt-2 text-center">
                          <button
                            onClick={() => setUploadMethod("text")}
                            className="text-sm font-medium text-muted-foreground underline hover:text-foreground"
                          >
                            Or paste text instead
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <textarea
                          className="min-h-[300px] w-full resize-none border-4 border-black bg-white px-4 py-3 font-medium shadow-[4px_4px_0px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-4 focus:ring-purple-500"
                          value={cvText}
                          onChange={(e) => setCvText(e.target.value)}
                          placeholder="Copy and paste your CV text here... (from PDF, Word, or any document)"
                          disabled={isExtracting}
                        />
                        <BrutalButton
                          onClick={handleTextExtraction}
                          disabled={isExtracting || !cvText || cvText.trim().length < 50}
                          className="w-full border-4 border-black bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[4px_4px_0px_#000000] hover:from-purple-600 hover:to-pink-600"
                        >
                          {isExtracting ? "EXTRACTING..." : "🚀 EXTRACT MY INFO"}
                        </BrutalButton>
                        <div className="border-4 border-black bg-yellow-300 p-3 shadow-[4px_4px_0px_#000000]">
                          <p className="text-sm font-bold text-black">
                            💡 Tip: Open your PDF, select all (Ctrl+A / Cmd+A), copy, and paste here
                          </p>
                        </div>

                        <div className="pt-2 text-center">
                          <button
                            onClick={() => setUploadMethod("pdf")}
                            className="text-sm font-medium text-muted-foreground underline hover:text-foreground"
                          >
                            ← Back to PDF upload
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {isExtracting && (
                    <div className="mt-4">
                      <div className="inline-block animate-pulse rounded border-4 border-red-600 bg-red-500 px-4 py-2 font-bold uppercase text-white shadow-[4px_4px_0px_#000000]">
                        🤖 AI is working...
                      </div>
                    </div>
                  )}
                  {dataExtracted && !isExtracting && (
                    <div className="mt-4">
                      <div className="inline-block rounded border-4 border-green-600 bg-green-500 px-4 py-2 font-bold uppercase text-white shadow-[4px_4px_0px_#000000]">
                        ✓ Data Extracted Successfully!
                      </div>
                    </div>
                  )}
                  {errors.cv && (
                    <div className="mt-4 border-4 border-red-600 bg-red-100 p-3 shadow-[4px_4px_0px_#000000]">
                      <p className="text-sm font-bold text-red-600">{errors.cv}</p>
                    </div>
                  )}

                  <div className="mt-8">
                    <button
                      onClick={skipToManualEntry}
                      className="text-sm font-bold uppercase text-muted-foreground underline hover:text-foreground"
                    >
                      Skip and enter manually →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="rounded border-4 border-green-600 bg-green-500 p-4 shadow-[4px_4px_0px_#000000]">
                  <p className="font-bold uppercase text-white">
                    ✓ AI is working - Information extracted from your CV. Please review and edit if needed.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide">Email Address *</label>
                  <BrutalInput
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                  {errors.email && <p className="mt-1 text-sm font-bold text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide">Full Name *</label>
                  <BrutalInput
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                  {errors.fullName && <p className="mt-1 text-sm font-bold text-red-600">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide">Phone Number</label>
                  <BrutalInput
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && <p className="mt-1 text-sm font-bold text-red-600">{errors.phone}</p>}
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
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide">Profile Summary</label>
                  <textarea
                    className="min-h-[100px] w-full resize-none border-4 border-black bg-input px-4 py-3 font-medium focus:outline-none focus:ring-4 focus:ring-ring"
                    value={formData.summary}
                    onChange={(e) => handleInputChange("summary", e.target.value)}
                    placeholder="Brief professional summary extracted from your CV..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide">
                    Skills (comma-separated)
                  </label>
                  <BrutalInput
                    value={formData.skills}
                    onChange={(e) => handleInputChange("skills", e.target.value)}
                    placeholder="JavaScript, React, Node.js, Python, SQL"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                {/* Experience Section */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold uppercase">Work Experience</h3>
                    <BrutalButton size="sm" onClick={addExperience}>
                      + Add Experience
                    </BrutalButton>
                  </div>

                  {structuredData.experience.length === 0 ? (
                    <div className="rounded border-4 border-dashed border-muted-foreground/30 bg-muted p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        No experience added yet. Click "Add Experience" to start.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {structuredData.experience.map((exp, index) => (
                        <div
                          key={index}
                          className="rounded border-4 border-black bg-muted p-4 shadow-[4px_4px_0px_#000000]"
                        >
                          <div className="mb-4 flex items-start justify-between">
                            <BrutalBadge variant="secondary">Experience {index + 1}</BrutalBadge>
                            <button
                              onClick={() => removeExperience(index)}
                              className="text-sm font-bold text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="mb-1 block text-xs font-bold uppercase">Job Title</label>
                              <BrutalInput
                                value={exp.title || ""}
                                onChange={(e) => updateExperience(index, "title", e.target.value)}
                                placeholder="Senior Software Engineer"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-bold uppercase">Company</label>
                              <BrutalInput
                                value={exp.company || ""}
                                onChange={(e) => updateExperience(index, "company", e.target.value)}
                                placeholder="Tech Corp"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="mb-1 block text-xs font-bold uppercase">Start Date</label>
                                <BrutalInput
                                  value={exp.startDate || ""}
                                  onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                                  placeholder="Jan 2020"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-bold uppercase">End Date</label>
                                <BrutalInput
                                  value={exp.endDate || ""}
                                  onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                                  placeholder="Present"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-bold uppercase">Description</label>
                              <textarea
                                className="min-h-[80px] w-full resize-none border-4 border-black bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-ring"
                                value={exp.description || ""}
                                onChange={(e) => updateExperience(index, "description", e.target.value)}
                                placeholder="Key responsibilities and achievements..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Education Section */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold uppercase">Education</h3>
                    <BrutalButton size="sm" onClick={addEducation}>
                      + Add Education
                    </BrutalButton>
                  </div>

                  {structuredData.education.length === 0 ? (
                    <div className="rounded border-4 border-dashed border-muted-foreground/30 bg-muted p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        No education added yet. Click "Add Education" to start.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {structuredData.education.map((edu, index) => (
                        <div
                          key={index}
                          className="rounded border-4 border-black bg-muted p-4 shadow-[4px_4px_0px_#000000]"
                        >
                          <div className="mb-4 flex items-start justify-between">
                            <BrutalBadge variant="secondary">Education {index + 1}</BrutalBadge>
                            <button
                              onClick={() => removeEducation(index)}
                              className="text-sm font-bold text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="mb-1 block text-xs font-bold uppercase">School/University</label>
                              <BrutalInput
                                value={edu.school || ""}
                                onChange={(e) => updateEducation(index, "school", e.target.value)}
                                placeholder="University of California"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-bold uppercase">Degree</label>
                              <BrutalInput
                                value={edu.degree || ""}
                                onChange={(e) => updateEducation(index, "degree", e.target.value)}
                                placeholder="Bachelor of Science in Computer Science"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="mb-1 block text-xs font-bold uppercase">Start Date</label>
                                <BrutalInput
                                  value={edu.startDate || ""}
                                  onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                                  placeholder="2016"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-bold uppercase">End Date</label>
                                <BrutalInput
                                  value={edu.endDate || ""}
                                  onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                                  placeholder="2020"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Certifications Section */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold uppercase">Certifications</h3>
                    <BrutalButton size="sm" onClick={addCertification}>
                      + Add Certification
                    </BrutalButton>
                  </div>

                  {structuredData.certifications.length === 0 ? (
                    <div className="rounded border-4 border-dashed border-muted-foreground/30 bg-muted p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        No certifications added yet. Click "Add Certification" to start.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {structuredData.certifications.map((cert, index) => (
                        <div
                          key={index}
                          className="rounded border-4 border-black bg-muted p-4 shadow-[4px_4px_0px_#000000]"
                        >
                          <div className="mb-4 flex items-start justify-between">
                            <BrutalBadge variant="secondary">Certification {index + 1}</BrutalBadge>
                            <button
                              onClick={() => removeCertification(index)}
                              className="text-sm font-bold text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="mb-1 block text-xs font-bold uppercase">Certification Name</label>
                              <BrutalInput
                                value={cert.name || ""}
                                onChange={(e) => updateCertification(index, "name", e.target.value)}
                                placeholder="AWS Certified Solutions Architect"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-bold uppercase">Issuing Organization</label>
                              <BrutalInput
                                value={cert.issuer || ""}
                                onChange={(e) => updateCertification(index, "issuer", e.target.value)}
                                placeholder="Amazon Web Services"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-bold uppercase">Date Obtained</label>
                              <BrutalInput
                                value={cert.date || ""}
                                onChange={(e) => updateCertification(index, "date", e.target.value)}
                                placeholder="June 2023"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide">LinkedIn URL</label>
                  <BrutalInput
                    value={formData.linkedinUrl}
                    onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                  {errors.linkedinUrl && <p className="mt-1 text-sm font-bold text-red-600">{errors.linkedinUrl}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide">GitHub URL</label>
                  <BrutalInput
                    value={formData.githubUrl}
                    onChange={(e) => handleInputChange("githubUrl", e.target.value)}
                    placeholder="https://github.com/johndoe"
                  />
                  {errors.githubUrl && <p className="mt-1 text-sm font-bold text-red-600">{errors.githubUrl}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide">Portfolio URL</label>
                  <BrutalInput
                    value={formData.portfolioUrl}
                    onChange={(e) => handleInputChange("portfolioUrl", e.target.value)}
                    placeholder="https://johndoe.com"
                  />
                  {errors.portfolioUrl && <p className="mt-1 text-sm font-bold text-red-600">{errors.portfolioUrl}</p>}
                </div>
              </div>
            )}

            {errors.submit && (
              <div className="mt-4 rounded border-4 border-red-600 bg-red-50 p-4">
                <p className="font-bold text-red-800">{errors.submit}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex justify-between">
              {step > 1 && (
                <BrutalButton variant="outline" onClick={prevStep} disabled={isLoading}>
                  BACK
                </BrutalButton>
              )}
              <div className="ml-auto">
                {step < 4 ? (
                  <BrutalButton
                    onClick={nextStep}
                    disabled={
                      (step === 1 && !dataExtracted) ||
                      (step === 2 && (!formData.email || !formData.fullName)) ||
                      isLoading
                    }
                  >
                    NEXT
                  </BrutalButton>
                ) : (
                  <BrutalButton onClick={handleSubmit} disabled={isLoading || !formData.email || !formData.fullName}>
                    {isLoading ? "CREATING ACCOUNT..." : "COMPLETE SETUP"}
                  </BrutalButton>
                )}
              </div>
            </div>
          </BrutalCardContent>
        </BrutalCard>
      </div>
    </div>
  )
}
