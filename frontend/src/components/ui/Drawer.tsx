import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../utils/cn"

export interface DrawerProps extends React.HTMLAttributes<HTMLDivElement> {
    open?: boolean
    onClose?: () => void
    title?: string
    side?: "left" | "right"
}

export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
    ({ className, open, onClose, title, side = "right", children, ...props }, ref) => {
        if (!open) return null

        return (
            <div className="fixed inset-0 z-50 flex">
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
                <div
                    ref={ref}
                    role="dialog"
                    className={cn(
                        "relative z-50 flex h-full w-3/4 max-w-sm flex-col bg-background shadow-lg transition-transform animate-in sm:max-w-md",
                        side === "right" ? "ml-auto slide-in-from-right" : "mr-auto slide-in-from-left",
                        className
                    )}
                    {...props}
                >
                    <div className="flex items-center justify-between border-b p-4">
                        {title && <h2 className="text-lg font-semibold">{title}</h2>}
                        <button
                            onClick={onClose}
                            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">{children}</div>
                </div>
            </div>
        )
    }
)
Drawer.displayName = "Drawer"
