import jsPDF from "jspdf"

interface CVData {
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
    title: string
    startDate: string
    endDate?: string
    description: string
  }>
  education: Array<{
    school: string
    degree: string
    startDate: string
    endDate?: string
  }>
  certifications: Array<{
    name: string
    issuer: string
    date: string
  }>
}

export async function generateATSFriendlyPDF(data: CVData, filename = "CV.pdf") {
  // Create new PDF document (A4 size, portrait)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // ATS-friendly settings
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  let yPosition = margin

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number, isBold = false, indent = 0) => {
    doc.setFontSize(fontSize)
    doc.setFont("helvetica", isBold ? "bold" : "normal")

    const lines = doc.splitTextToSize(text, contentWidth - indent)
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage()
        yPosition = margin
      }
      doc.text(line, margin + indent, yPosition)
      yPosition += fontSize * 0.5
    })
  }

  // Helper function to add section header
  const addSectionHeader = (title: string) => {
    yPosition += 5
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(title.toUpperCase(), margin, yPosition)
    doc.line(margin, yPosition + 1, pageWidth - margin, yPosition + 1)
    yPosition += 7
  }

  // Contact Information (centered)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(data.personalInfo.fullName.toUpperCase(), pageWidth / 2, yPosition, { align: "center" })
  yPosition += 7

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  const contactLine1 = [data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location]
    .filter(Boolean)
    .join(" | ")
  doc.text(contactLine1, pageWidth / 2, yPosition, { align: "center" })
  yPosition += 5

  if (data.personalInfo.linkedinUrl || data.personalInfo.githubUrl || data.personalInfo.portfolioUrl) {
    const contactLine2 = [data.personalInfo.linkedinUrl, data.personalInfo.githubUrl, data.personalInfo.portfolioUrl]
      .filter(Boolean)
      .join(" | ")
    doc.text(contactLine2, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 5
  }

  // Professional Summary
  if (data.summary) {
    addSectionHeader("Professional Summary")
    addText(data.summary, 10)
    yPosition += 3
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    addSectionHeader("Skills")
    addText(data.skills.join(" • "), 10)
    yPosition += 3
  }

  // Professional Experience
  if (data.experience && data.experience.length > 0) {
    addSectionHeader("Professional Experience")

    data.experience.forEach((exp, index) => {
      // Job title and company
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      const titleText = exp.title + (exp.company ? ` - ${exp.company}` : "")
      doc.text(titleText, margin, yPosition)

      // Dates (right-aligned)
      const dateText = exp.startDate + (exp.endDate ? ` - ${exp.endDate}` : "")
      doc.setFontSize(10)
      doc.setFont("helvetica", "italic")
      doc.text(dateText, pageWidth - margin, yPosition, { align: "right" })
      yPosition += 6

      // Description
      if (exp.description) {
        doc.setFont("helvetica", "normal")
        const descLines = exp.description.split("\n")
        descLines.forEach((line) => {
          if (line.trim()) {
            const cleanLine = line.replace(/^[•-]\s*/, "")
            if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
              addText("• " + cleanLine, 10, false, 5)
            } else {
              addText(cleanLine, 10)
            }
          }
        })
      }

      if (index < data.experience.length - 1) {
        yPosition += 4
      }
    })
    yPosition += 3
  }

  // Education
  if (data.education && data.education.length > 0) {
    addSectionHeader("Education")

    data.education.forEach((edu) => {
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      const eduText = edu.degree + (edu.school ? ` - ${edu.school}` : "")
      doc.text(eduText, margin, yPosition)

      // Dates (right-aligned)
      const dateText = edu.startDate + (edu.endDate ? ` - ${edu.endDate}` : "")
      doc.setFontSize(10)
      doc.setFont("helvetica", "italic")
      doc.text(dateText, pageWidth - margin, yPosition, { align: "right" })
      yPosition += 7
    })
    yPosition += 3
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    addSectionHeader("Certifications")

    data.certifications.forEach((cert) => {
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      const certText = cert.name + (cert.issuer ? ` - ${cert.issuer}` : "")
      doc.text(certText, margin, yPosition)

      if (cert.date) {
        doc.setFont("helvetica", "italic")
        doc.text(`(${cert.date})`, pageWidth - margin, yPosition, { align: "right" })
      }
      yPosition += 6
    })
  }

  // Save the PDF
  doc.save(filename)
}

export async function generateCoverLetterPDF(content: string, filename = "Cover_Letter.pdf") {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  let yPosition = margin

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")

  // Split content into paragraphs
  const paragraphs = content.split("\n\n")

  paragraphs.forEach((paragraph) => {
    if (paragraph.trim()) {
      const lines = doc.splitTextToSize(paragraph.trim(), contentWidth)
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }
        doc.text(line, margin, yPosition)
        yPosition += 6
      })
      yPosition += 4 // Space between paragraphs
    }
  })

  doc.save(filename)
}

export async function generateCVTextPDF(content: string, filename = "CV.pdf") {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  let yPosition = margin

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")

  // Split content into paragraphs
  const paragraphs = content.split("\n\n")

  paragraphs.forEach((paragraph) => {
    if (paragraph.trim()) {
      const lines = doc.splitTextToSize(paragraph.trim(), contentWidth)
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }
        doc.text(line, margin, yPosition)
        yPosition += 6
      })
      yPosition += 4 // Space between paragraphs
    }
  })

  doc.save(filename)
}
