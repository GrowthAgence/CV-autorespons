import Link from "next/link"
import { BrutalButton } from "@/components/ui/brutal-button"
import { BrutalCard, BrutalCardContent, BrutalCardHeader, BrutalCardTitle } from "@/components/ui/brutal-card"
import { BrutalBadge } from "@/components/ui/brutal-badge"

export default function ExtensionWelcomePage() {
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <BrutalBadge variant="success" className="mb-4">
            EXTENSION INSTALLED
          </BrutalBadge>
          <h1 className="mb-4 text-3xl font-bold uppercase tracking-tight md:text-5xl">Welcome to JobBot Extension!</h1>
          <p className="text-lg text-muted-foreground">
            Your Chrome extension is ready to capture job postings automatically
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <BrutalCard>
            <BrutalCardHeader>
              <BrutalCardTitle>How to Use</BrutalCardTitle>
            </BrutalCardHeader>
            <BrutalCardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-bold">Visit Job Sites</h4>
                  <p className="text-sm text-muted-foreground">
                    Go to LinkedIn, Indeed, Glassdoor, or other supported job sites
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center bg-secondary text-secondary-foreground font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-bold">Click the Extension</h4>
                  <p className="text-sm text-muted-foreground">
                    Click the JobBot icon in your browser toolbar or the floating capture button
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center bg-accent text-accent-foreground font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-bold">Capture Jobs</h4>
                  <p className="text-sm text-muted-foreground">
                    The extension will automatically extract job details and save them to your dashboard
                  </p>
                </div>
              </div>
            </BrutalCardContent>
          </BrutalCard>

          <BrutalCard>
            <BrutalCardHeader>
              <BrutalCardTitle>Supported Sites</BrutalCardTitle>
            </BrutalCardHeader>
            <BrutalCardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BrutalBadge variant="outline" className="text-xs">
                    SUPPORTED
                  </BrutalBadge>
                  <span>LinkedIn Jobs</span>
                </div>
                <div className="flex items-center gap-2">
                  <BrutalBadge variant="outline" className="text-xs">
                    SUPPORTED
                  </BrutalBadge>
                  <span>Indeed</span>
                </div>
                <div className="flex items-center gap-2">
                  <BrutalBadge variant="outline" className="text-xs">
                    SUPPORTED
                  </BrutalBadge>
                  <span>Glassdoor</span>
                </div>
                <div className="flex items-center gap-2">
                  <BrutalBadge variant="outline" className="text-xs">
                    SUPPORTED
                  </BrutalBadge>
                  <span>Google Jobs</span>
                </div>
                <div className="flex items-center gap-2">
                  <BrutalBadge variant="outline" className="text-xs">
                    SUPPORTED
                  </BrutalBadge>
                  <span>Stack Overflow Jobs</span>
                </div>
                <div className="flex items-center gap-2">
                  <BrutalBadge variant="outline" className="text-xs">
                    SUPPORTED
                  </BrutalBadge>
                  <span>AngelList / Wellfound</span>
                </div>
              </div>
            </BrutalCardContent>
          </BrutalCard>
        </div>

        <div className="mt-8 text-center">
          <div className="mb-6">
            <h2 className="mb-4 text-2xl font-bold uppercase">Ready to Get Started?</h2>
            <p className="text-muted-foreground">
              Create your JobBot account or connect your existing account to start capturing jobs
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <BrutalButton size="lg" asChild>
              <Link href="/onboarding">CREATE ACCOUNT</Link>
            </BrutalButton>
            <BrutalButton variant="outline" size="lg" asChild>
              <Link href="/dashboard">GO TO DASHBOARD</Link>
            </BrutalButton>
          </div>
        </div>
      </div>
    </div>
  )
}
