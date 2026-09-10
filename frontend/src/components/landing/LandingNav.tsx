import { Link, useNavigate } from "react-router-dom"
import { GitBranch } from "lucide-react"
import { Button } from "../ui/Button"

export const LandingNav = () => {
    const navigate = useNavigate()

    return (
        <header className="sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-background/95">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-sm">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-5 w-5"
                            >
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                        <span className="font-bold text-lg tracking-tight text-foreground">EKA</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                            Features
                        </a>
                        <a href="#architecture" className="text-muted-foreground hover:text-foreground transition-colors">
                            Architecture
                        </a>
                        <a href="#roadmap" className="text-muted-foreground hover:text-foreground transition-colors">
                            Roadmap
                        </a>
                    </nav>

                    <div className="flex items-center gap-3">
                        <a 
                            href="https://github.com" 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-foreground hidden sm:flex items-center p-2 rounded-md hover:bg-accent transition-colors"
                        >
                            <GitBranch className="h-4 w-4" />
                            <span className="sr-only">GitHub</span>
                        </a>
                        <Button 
                            variant="ghost" 
                            onClick={() => navigate("/login")}
                            className="text-sm font-medium"
                        >
                            Login
                        </Button>
                        <Button 
                            onClick={() => navigate("/register")}
                            className="text-sm font-medium shadow-sm"
                        >
                            Get Started
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}
