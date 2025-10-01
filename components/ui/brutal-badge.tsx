import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const brutalBadgeVariants = cva(
  "inline-flex items-center border-4 border-black px-3 py-1 text-xs font-bold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        accent: "bg-accent text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        success: "bg-green-500 text-white",
        warning: "bg-yellow-500 text-black",
        outline: "bg-background text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BrutalBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof brutalBadgeVariants> {}

function BrutalBadge({ className, variant, ...props }: BrutalBadgeProps) {
  return <div className={cn(brutalBadgeVariants({ variant }), className)} {...props} />
}

export { BrutalBadge, brutalBadgeVariants }
