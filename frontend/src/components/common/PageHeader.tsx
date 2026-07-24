import * as React from "react"
import { cn } from "../../utils/cn"

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
    actions?: React.ReactNode;
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
    ({ className, title, description, actions, ...props }, ref) => {
        return (
            <div ref={ref} className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6", className)} {...props}>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    {description && <p className="text-muted-foreground">{description}</p>}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
        )
    }
)
PageHeader.displayName = "PageHeader"
