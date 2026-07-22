import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../utils/cn"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    error?: boolean
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, error, children, ...props }, ref) => {
        return (
            <div className="relative w-full">
                <select
                    className={cn(
                        "flex h-9 w-full appearance-none rounded-md border border-input bg-transparent px-3 py-1 pr-8 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-danger focus-visible:ring-danger",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 opacity-50" />
            </div>
        )
    }
)
Select.displayName = "Select"
