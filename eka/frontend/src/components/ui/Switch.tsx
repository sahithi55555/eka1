import * as React from "react"
import { cn } from "../../utils/cn"

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, ...props }, ref) => {
        return (
            <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" ref={ref} {...props} />
                <div className={cn(
                    "h-6 w-11 rounded-full border-2 border-transparent bg-input transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background peer-checked:bg-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                    className
                )}>
                    <div className="h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform peer-checked:translate-x-5" />
                </div>
            </label>
        )
    }
)
Switch.displayName = "Switch"
