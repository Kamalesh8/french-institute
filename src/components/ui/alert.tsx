import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full flex items-center gap-3 px-4 py-3 text-sm [&>svg+div]:translate-y-[-1px] [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border",
        destructive:
          "text-destructive border-destructive/50 dark:border-destructive [&>svg]:text-destructive",
        warning: "text-amber-600 border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 [&>svg]:text-amber-600",
        success: "text-emerald-600 border-emerald-200 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-900/20 [&>svg]:text-emerald-600",
        info: "text-blue-600 border-blue-200 dark:border-blue-700/50 bg-blue-50 dark:bg-blue-900/20 [&>svg]:text-blue-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
