import { GitBranch, FileText, Bot } from "lucide-react"

export const LandingFooter = () => {
    return (
        <footer className="bg-background border-t py-12 md:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Bot className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">EKA Platform</span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <a href="#" className="hover:text-foreground transition-colors flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Documentation
                        </a>
                        <a href="#" className="hover:text-foreground transition-colors flex items-center gap-2">
                            <GitBranch className="h-4 w-4" />
                            GitHub
                        </a>
                    </div>
                </div>

                <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t pt-8 text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} Enterprise Knowledge Assistant. All rights reserved.</p>
                    <p>Version <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">1.0.0-rc</span></p>
                </div>
            </div>
        </footer>
    )
}
