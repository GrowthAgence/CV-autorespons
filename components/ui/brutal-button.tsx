import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const brutalButtonVariants = cva(
  "border-4 border-black font-bold uppercase tracking-wide transition-all duration-150 inline-flex items-center justify-center whitespace-nowrap text-sm disabled:pointer-events-none disabled:opacity-50 shadow-[4px_4px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_#000000] active:translate-x-2 active:translate-y-2 active:shadow-[0px_0px_0px_#000000]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        success: "bg-green-500 text-white hover:bg-green-600",
        outline: "border-2 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2 text-xs",
        lg: "h-14 px-8 py-4 text-base",
        xl: "h-16 px-10 py-5 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface BrutalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof brutalButtonVariants> {
  asChild?: boolean
}

const BrutalButton = React.forwardRef<HTMLButtonElement, BrutalButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(brutalButtonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
BrutalButton.displayName = "BrutalButton"

export { BrutalButton, brutalButtonVariants }
