import { BrutalCard, BrutalCardContent, BrutalCardHeader, BrutalCardTitle } from "@/components/ui/brutal-card"

interface StatsCardsProps {
  stats: {
    totalJobs: number
    activeApplications: number
    interviews: number
    responseRate: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <BrutalCard>
        <BrutalCardHeader>
          <BrutalCardTitle className="text-lg">Total Jobs</BrutalCardTitle>
        </BrutalCardHeader>
        <BrutalCardContent>
          <div className="text-3xl font-bold text-primary">{stats.totalJobs}</div>
          <p className="text-sm text-muted-foreground">Jobs captured</p>
        </BrutalCardContent>
      </BrutalCard>

      <BrutalCard>
        <BrutalCardHeader>
          <BrutalCardTitle className="text-lg">Active Applications</BrutalCardTitle>
        </BrutalCardHeader>
        <BrutalCardContent>
          <div className="text-3xl font-bold text-secondary">{stats.activeApplications}</div>
          <p className="text-sm text-muted-foreground">Applications sent</p>
        </BrutalCardContent>
      </BrutalCard>

      <BrutalCard>
        <BrutalCardHeader>
          <BrutalCardTitle className="text-lg">Interviews</BrutalCardTitle>
        </BrutalCardHeader>
        <BrutalCardContent>
          <div className="text-3xl font-bold text-accent">{stats.interviews}</div>
          <p className="text-sm text-muted-foreground">Interview scheduled</p>
        </BrutalCardContent>
      </BrutalCard>

      <BrutalCard>
        <BrutalCardHeader>
          <BrutalCardTitle className="text-lg">Response Rate</BrutalCardTitle>
        </BrutalCardHeader>
        <BrutalCardContent>
          <div className="text-3xl font-bold text-success">{stats.responseRate}%</div>
          <p className="text-sm text-muted-foreground">Success rate</p>
        </BrutalCardContent>
      </BrutalCard>
    </div>
  )
}
