import * as React from "react"
import { cn } from "../../utils/cn"

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
    ({ className, title, children, ...props }, ref) => {
        return (
            <div className="group relative inline-block" ref={ref} {...props}>
                {children}
                <div
                    className={cn(
                        "pointer-events-none absolute -top-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground opacity-0 shadow-sm transition-opacity animate-in fade-in-50 group-hover:opacity-100",
                        className
                    )}
                >
                    {title}
                </div>
            </div>
        )
    }
)
Tooltip.displayName = "Tooltip"
