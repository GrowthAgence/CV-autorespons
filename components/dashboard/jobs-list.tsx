"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BrutalCard, BrutalCardContent, BrutalCardHeader, BrutalCardTitle } from "@/components/ui/brutal-card"
import { BrutalButton } from "@/components/ui/brutal-button"
import { BrutalBadge } from "@/components/ui/brutal-badge"
import type { JobPost } from "@/lib/database"

interface JobPostWithApplication extends JobPost {
  application_date?: string | null
}

interface JobsListProps {
  jobs: JobPostWithApplication[]
}

export function JobsList({ jobs }: JobsListProps) {
  const router = useRouter()
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null)

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job? This will also delete any associated applications.")) {
      return
    }

    setDeletingJobId(jobId)
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert("Failed to delete job")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete job")
    } finally {
      setDeletingJobId(null)
    }
  }

  const formatApplicationDate = (dateString: string) => {
    const date = new Date(dateString)
    const dateFormatted = date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    const timeFormatted = date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
    return `Applied le ${dateFormatted} à ${timeFormatted}`
  }

  if (jobs.length === 0) {
    return (
      <BrutalCard>
        <BrutalCardContent className="p-12 text-center">
          <div className="mb-4 text-6xl">📋</div>
          <h3 className="mb-2 text-xl font-bold uppercase">No Jobs Yet</h3>
          <p className="mb-6 text-muted-foreground">
            Start by adding a job manually or install our Chrome extension to capture jobs automatically
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <BrutalButton asChild>
              <Link href="/dashboard/add-job">ADD JOB MANUALLY</Link>
            </BrutalButton>
            <BrutalButton variant="outline" asChild>
              <Link href="/extension">GET CHROME EXTENSION</Link>
            </BrutalButton>
          </div>
        </BrutalCardContent>
      </BrutalCard>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold uppercase tracking-tight">Captured Jobs</h2>
        <BrutalButton asChild>
          <Link href="/dashboard/add-job">ADD JOB</Link>
        </BrutalButton>
      </div>

      <div className="grid gap-6">
        {jobs.map((job) => (
          <BrutalCard key={job.id}>
            <BrutalCardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <BrutalCardTitle className="text-xl">{job.title}</BrutalCardTitle>
                  <p className="text-lg font-bold text-foreground">{job.company}</p>
                  <p className="text-muted-foreground">{job.location}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <BrutalBadge variant={job.status === "active" ? "success" : "secondary"}>
                    {job.status.toUpperCase()}
                  </BrutalBadge>
                  {job.job_type && <BrutalBadge variant="outline">{job.job_type.toUpperCase()}</BrutalBadge>}
                </div>
              </div>
            </BrutalCardHeader>
            <BrutalCardContent>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>
              </div>

              {job.application_date && (
                <div className="mb-4 rounded-lg border-4 border-green-500 bg-green-50 p-3">
                  <p className="text-sm font-bold text-green-800">✓ {formatApplicationDate(job.application_date)}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {job.salary_range && <span>💰 {job.salary_range}</span>}
                  {job.posted_date && <span>📅 {new Date(job.posted_date).toLocaleDateString()}</span>}
                  {job.deadline && (
                    <span className="text-warning">⏰ Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <BrutalButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(job.id)}
                    disabled={deletingJobId === job.id}
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    {deletingJobId === job.id ? "DELETING..." : "DELETE"}
                  </BrutalButton>
                  <BrutalButton variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/jobs/${job.id}`}>VIEW</Link>
                  </BrutalButton>
                  <BrutalButton size="sm" asChild>
                    <Link href={`/dashboard/jobs/${job.id}/apply`}>APPLY</Link>
                  </BrutalButton>
                </div>
              </div>
            </BrutalCardContent>
          </BrutalCard>
        ))}
      </div>
    </div>
  )
}
