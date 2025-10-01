import { BrutalCard, BrutalCardContent, BrutalCardHeader, BrutalCardTitle } from "@/components/ui/brutal-card"

interface ApplicationsStatsProps {
  stats: {
    total: number
    draft: number
    submitted: number
    interview: number
    rejected: number
    accepted: number
  }
}

export function ApplicationsStats({ stats }: ApplicationsStatsProps) {
  const responseRate = stats.total > 0 ? Math.round(((stats.interview + stats.accepted) / stats.total) * 100) : 0
  const successRate = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <BrutalCard>
        <BrutalCardHeader>
          <BrutalCardTitle className="text-lg">Total Applications</BrutalCardTitle>
        </BrutalCardHeader>
        <BrutalCardContent>
          <div className="text-3xl font-bold text-primary">{stats.total}</div>
          <p className="text-sm text-muted-foreground">All time</p>
        </BrutalCardContent>
      </BrutalCard>

      <BrutalCard>
        <BrutalCardHeader>
          <BrutalCardTitle className="text-lg">In Progress</BrutalCardTitle>
        </BrutalCardHeader>
        <BrutalCardContent>
          <div className="text-3xl font-bold text-secondary">{stats.submitted + stats.interview}</div>
          <p className="text-sm text-muted-foreground">Active applications</p>
        </BrutalCardContent>
      </BrutalCard>

      <BrutalCard>
        <BrutalCardHeader>
          <BrutalCardTitle className="text-lg">Response Rate</BrutalCardTitle>
        </BrutalCardHeader>
        <BrutalCardContent>
          <div className="text-3xl font-bold text-accent">{responseRate}%</div>
          <p className="text-sm text-muted-foreground">Interview + offers</p>
        </BrutalCardContent>
      </BrutalCard>

      <BrutalCard>
        <BrutalCardHeader>
          <BrutalCardTitle className="text-lg">Success Rate</BrutalCardTitle>
        </BrutalCardHeader>
        <BrutalCardContent>
          <div className="text-3xl font-bold text-success">{successRate}%</div>
          <p className="text-sm text-muted-foreground">Job offers received</p>
        </BrutalCardContent>
      </BrutalCard>
    </div>
  )
}
