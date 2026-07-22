import * as React from "react"
import { cn } from "../../utils/cn"

export interface NavItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    active?: boolean
    icon?: React.ReactNode
    variant?: "sidebar" | "top"
}

export const NavItem = React.forwardRef<HTMLAnchorElement, NavItemProps>(
    ({ className, active, icon, variant = "sidebar", children, ...props }, ref) => {
        return (
            <a
                ref={ref}
                className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                    {
                        "bg-accent text-accent-foreground": active,
                        "text-muted-foreground": !active,
                        "w-full flex-row": variant === "sidebar",
                        "flex-col justify-center text-xs h-16 w-16": variant === "top",
                    },
                    className
                )}
                {...props}
            >
                {icon && <span className="flex items-center justify-center">{icon}</span>}
                <span>{children}</span>
            </a>
        )
    }
)
NavItem.displayName = "NavItem"
