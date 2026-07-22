import * as React from "react"
import { cn } from "../../utils/cn"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "danger" | "success" | "warning"
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
    ({ className, variant = "default", ...props }, ref) => (
        <div
            ref={ref}
            role="alert"
            className={cn(
                "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
                {
                    "bg-background text-foreground": variant === "default",
                    "border-danger/50 text-danger dark:border-danger [&>svg]:text-danger": variant === "danger",
                },
                className
            )}
            {...props}
        />
    )
)
Alert.displayName = "Alert"

export const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h5 ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
    )
)
AlertTitle.displayName = "AlertTitle"

export const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
    )
)
AlertDescription.displayName = "AlertDescription"
