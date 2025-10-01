import * as React from "react"
import { cn } from "@/lib/utils"

const BrutalCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("border-4 border-black bg-card p-6 shadow-[4px_4px_0px_#000000]", className)}
      {...props}
    />
  ),
)
BrutalCard.displayName = "BrutalCard"

const BrutalCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-2 pb-4", className)} {...props} />
  ),
)
BrutalCardHeader.displayName = "BrutalCardHeader"

const BrutalCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-bold uppercase tracking-wide", className)} {...props} />
  ),
)
BrutalCardTitle.displayName = "BrutalCardTitle"

const BrutalCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-muted-foreground font-medium", className)} {...props} />
  ),
)
BrutalCardDescription.displayName = "BrutalCardDescription"

const BrutalCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("", className)} {...props} />,
)
BrutalCardContent.displayName = "BrutalCardContent"

const BrutalCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center pt-4", className)} {...props} />,
)
BrutalCardFooter.displayName = "BrutalCardFooter"

export { BrutalCard, BrutalCardHeader, BrutalCardFooter, BrutalCardTitle, BrutalCardDescription, BrutalCardContent }
