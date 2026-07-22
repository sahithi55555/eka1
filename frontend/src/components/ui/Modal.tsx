import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../utils/cn"

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
    open?: boolean
    onClose?: () => void
    title?: string
    description?: string
    footer?: React.ReactNode
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
    ({ className, open, onClose, title, description, children, footer, ...props }, ref) => {
        if (!open) return null

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
                <div
                    ref={ref}
                    role="dialog"
                    className={cn(
                        "relative z-50 w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg sm:rounded-xl animate-in fade-in-90 zoom-in-95",
                        className
                    )}
                    {...props}
                >
                    <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                        {title && <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>}
                        {description && <p className="text-sm text-muted-foreground">{description}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </button>
                    <div className="mt-4">{children}</div>
                    {footer && <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">{footer}</div>}
                </div>
            </div>
        )
    }
)
Modal.displayName = "Modal"
