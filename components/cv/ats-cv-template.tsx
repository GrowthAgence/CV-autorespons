interface ATSCVTemplateProps {
  data: {
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
}

export function ATSCVTemplate({ data }: ATSCVTemplateProps) {
  return (
    <div
      id="ats-cv-template"
      style={{
        fontFamily: "Arial, sans-serif",
        fontSize: "11pt",
        lineHeight: "1.5",
        color: "#000000",
        backgroundColor: "#ffffff",
        maxWidth: "8.5in",
        margin: "0 auto",
        padding: "0.5in",
      }}
    >
      {/* Contact Information - Top of page, not in header */}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "16pt",
            fontWeight: "bold",
            margin: "0 0 8px 0",
            textTransform: "uppercase",
          }}
        >
          {data.personalInfo.fullName}
        </h1>
        <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && (
            <>
              {" | "}
              <span>{data.personalInfo.phone}</span>
            </>
          )}
          {data.personalInfo.location && (
            <>
              {" | "}
              <span>{data.personalInfo.location}</span>
            </>
          )}
        </div>
        {(data.personalInfo.linkedinUrl || data.personalInfo.githubUrl || data.personalInfo.portfolioUrl) && (
          <div style={{ fontSize: "10pt", lineHeight: "1.4", marginTop: "4px" }}>
            {data.personalInfo.linkedinUrl && <span>{data.personalInfo.linkedinUrl}</span>}
            {data.personalInfo.githubUrl && (
              <>
                {data.personalInfo.linkedinUrl && " | "}
                <span>{data.personalInfo.githubUrl}</span>
              </>
            )}
            {data.personalInfo.portfolioUrl && (
              <>
                {(data.personalInfo.linkedinUrl || data.personalInfo.githubUrl) && " | "}
                <span>{data.personalInfo.portfolioUrl}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Professional Summary */}
      {data.summary && (
        <div style={{ marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "12pt",
              fontWeight: "bold",
              margin: "0 0 8px 0",
              textTransform: "uppercase",
              borderBottom: "1px solid #000000",
              paddingBottom: "4px",
            }}
          >
            Professional Summary
          </h2>
          <p style={{ margin: "0", textAlign: "justify" }}>{data.summary}</p>
        </div>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "12pt",
              fontWeight: "bold",
              margin: "0 0 8px 0",
              textTransform: "uppercase",
              borderBottom: "1px solid #000000",
              paddingBottom: "4px",
            }}
          >
            Skills
          </h2>
          <p style={{ margin: "0" }}>{data.skills.join(" • ")}</p>
        </div>
      )}

      {/* Professional Experience */}
      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "12pt",
              fontWeight: "bold",
              margin: "0 0 12px 0",
              textTransform: "uppercase",
              borderBottom: "1px solid #000000",
              paddingBottom: "4px",
            }}
          >
            Professional Experience
          </h2>
          {data.experience.map((exp, index) => (
            <div key={index} style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <div>
                  <strong style={{ fontSize: "11pt" }}>{exp.title}</strong>
                  {exp.company && <span> - {exp.company}</span>}
                </div>
                <div style={{ fontSize: "10pt", fontStyle: "italic" }}>
                  {exp.startDate}
                  {exp.endDate && ` - ${exp.endDate}`}
                </div>
              </div>
              {exp.description && (
                <div style={{ marginLeft: "0", fontSize: "10pt" }}>
                  {exp.description.split("\n").map((line, i) => (
                    <div key={i} style={{ marginBottom: "4px" }}>
                      {line.trim().startsWith("•") || line.trim().startsWith("-") ? (
                        <div style={{ paddingLeft: "20px", textIndent: "-20px" }}>• {line.replace(/^[•-]\s*/, "")}</div>
                      ) : (
                        <p style={{ margin: "0 0 4px 0" }}>{line}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "12pt",
              fontWeight: "bold",
              margin: "0 0 12px 0",
              textTransform: "uppercase",
              borderBottom: "1px solid #000000",
              paddingBottom: "4px",
            }}
          >
            Education
          </h2>
          {data.education.map((edu, index) => (
            <div key={index} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <strong>{edu.degree}</strong>
                  {edu.school && <span> - {edu.school}</span>}
                </div>
                <div style={{ fontSize: "10pt", fontStyle: "italic" }}>
                  {edu.startDate}
                  {edu.endDate && ` - ${edu.endDate}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "12pt",
              fontWeight: "bold",
              margin: "0 0 12px 0",
              textTransform: "uppercase",
              borderBottom: "1px solid #000000",
              paddingBottom: "4px",
            }}
          >
            Certifications
          </h2>
          {data.certifications.map((cert, index) => (
            <div key={index} style={{ marginBottom: "8px" }}>
              <strong>{cert.name}</strong>
              {cert.issuer && <span> - {cert.issuer}</span>}
              {cert.date && <span style={{ fontSize: "10pt", fontStyle: "italic" }}> ({cert.date})</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
