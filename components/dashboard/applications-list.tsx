"use client"

import { useState } from "react"
import Link from "next/link"
import { BrutalCard, BrutalCardContent, BrutalCardHeader, BrutalCardTitle } from "@/components/ui/brutal-card"
import { BrutalButton } from "@/components/ui/brutal-button"
import { BrutalBadge } from "@/components/ui/brutal-badge"

interface Application {
  id: string
  status: string
  title: string
  company: string
  location?: string
  salary_range?: string
  application_date?: string
  interview_date?: string
  follow_up_date?: string
  notes?: string
  created_at: string
}

interface ApplicationsListProps {
  applications: Application[]
}

export function ApplicationsList({ applications }: ApplicationsListProps) {
  const [filter, setFilter] = useState("all")

  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true
    return app.status === filter
  })

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

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  if (applications.length === 0) {
    return (
      <BrutalCard>
        <BrutalCardContent className="p-12 text-center">
          <div className="mb-4 text-6xl">📄</div>
          <h3 className="mb-2 text-xl font-bold uppercase">No Applications Yet</h3>
          <p className="mb-6 text-muted-foreground">Start applying to jobs to see your applications here</p>
          <BrutalButton asChild>
            <Link href="/dashboard">VIEW JOBS</Link>
          </BrutalButton>
        </BrutalCardContent>
      </BrutalCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {["all", "draft", "submitted", "interview", "accepted", "rejected"].map((status) => (
          <BrutalButton
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status.toUpperCase()}
            {status !== "all" && (
              <span className="ml-2">({applications.filter((a) => a.status === status).length})</span>
            )}
          </BrutalButton>
        ))}
      </div>

      {/* Applications Grid */}
      <div className="grid gap-6">
        {filteredApplications.map((application) => (
          <BrutalCard key={application.id}>
            <BrutalCardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <BrutalCardTitle className="text-xl">{application.title}</BrutalCardTitle>
                  <p className="text-lg font-bold text-secondary">{application.company}</p>
                  <p className="text-muted-foreground">{application.location}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <BrutalBadge variant={getStatusColor(application.status) as any}>
                    {application.status.toUpperCase()}
                  </BrutalBadge>
                  {application.salary_range && <BrutalBadge variant="outline">{application.salary_range}</BrutalBadge>}
                </div>
              </div>
            </BrutalCardHeader>
            <BrutalCardContent>
              <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                <div>Applied: {new Date(application.created_at).toLocaleDateString()}</div>
                {application.interview_date && (
                  <div>Interview: {new Date(application.interview_date).toLocaleDateString()}</div>
                )}
                {application.follow_up_date && (
                  <div>Follow-up: {new Date(application.follow_up_date).toLocaleDateString()}</div>
                )}
                {application.notes && <div>Notes: {application.notes}</div>}
              </div>

              <div className="flex items-center justify-between">
                {/* Status Update Buttons */}
                <div className="flex gap-2">
                  {application.status === "draft" && (
                    <BrutalButton size="sm" onClick={() => updateApplicationStatus(application.id, "submitted")}>
                      MARK SUBMITTED
                    </BrutalButton>
                  )}
                  {application.status === "submitted" && (
                    <>
                      <BrutalButton
                        size="sm"
                        variant="accent"
                        onClick={() => updateApplicationStatus(application.id, "interview")}
                      >
                        GOT INTERVIEW
                      </BrutalButton>
                      <BrutalButton
                        size="sm"
                        variant="destructive"
                        onClick={() => updateApplicationStatus(application.id, "rejected")}
                      >
                        REJECTED
                      </BrutalButton>
                    </>
                  )}
                  {application.status === "interview" && (
                    <>
                      <BrutalButton
                        size="sm"
                        variant="success"
                        onClick={() => updateApplicationStatus(application.id, "accepted")}
                      >
                        GOT OFFER
                      </BrutalButton>
                      <BrutalButton
                        size="sm"
                        variant="destructive"
                        onClick={() => updateApplicationStatus(application.id, "rejected")}
                      >
                        REJECTED
                      </BrutalButton>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <BrutalButton variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/applications/${application.id}`}>VIEW DETAILS</Link>
                  </BrutalButton>
                  {application.status === "draft" && (
                    <BrutalButton size="sm" asChild>
                      <Link href={`/dashboard/applications/${application.id}/edit`}>EDIT</Link>
                    </BrutalButton>
                  )}
                </div>
              </div>
            </BrutalCardContent>
          </BrutalCard>
        ))}
      </div>
    </div>
  )
}
