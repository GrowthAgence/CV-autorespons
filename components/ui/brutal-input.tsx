import * as React from "react"
import { cn } from "@/lib/utils"

export interface BrutalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const BrutalInput = React.forwardRef<HTMLInputElement, BrutalInputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "border-4 border-black bg-input px-4 py-3 font-medium focus:outline-none focus:ring-4 focus:ring-ring w-full",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
BrutalInput.displayName = "BrutalInput"

export { BrutalInput }
