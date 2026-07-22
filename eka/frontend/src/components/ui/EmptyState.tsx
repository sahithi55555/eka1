import * as React from "react"
import { cn } from "../../utils/cn"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    icon?: React.ReactNode
    title: string
    description: string
    action?: React.ReactNode
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
    ({ className, icon, title, description, action, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50",
                    className
                )}
                {...props}
            >
                {icon && <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4 text-muted-foreground">{icon}</div>}
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>
                {action && <div className="mt-4">{action}</div>}
            </div>
        )
    }
)
EmptyState.displayName = "EmptyState"
