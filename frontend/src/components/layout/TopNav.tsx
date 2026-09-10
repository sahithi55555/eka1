import React, { useEffect, useState, useRef } from "react"
import { Search as SearchIcon, Sun, Moon, Menu, User, Settings, LogOut, Sparkles } from "lucide-react"
import { useTheme } from "../../contexts/ThemeContext"
import { Input } from "../ui/Input"
import { Button } from "../ui/Button"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "../ui/Breadcrumb"
import { useLocation, useNavigate, Link } from "react-router-dom"
import { authService } from "../../features/auth/services/authService"

interface UserInfo {
    full_name?: string
    email?: string
    role?: string
    designation?: string
}

export const TopNav = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
    const { theme, setTheme } = useTheme()
    const location = useLocation()
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState("")
    const [user, setUser] = useState<UserInfo | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let isMounted = true
        authService.getCurrentUser()
            .then(userData => { if (isMounted) setUser(userData) })
            .catch(() => { if (isMounted) setUser(null) })
        return () => { isMounted = false }
    }, [location.pathname])

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return
        navigate(`/chat?q=${encodeURIComponent(searchQuery.trim())}`)
        setSearchQuery("")
    }

    const handleLogout = () => {
        authService.logout()
        navigate("/login")
    }

    // Format breadcrumb title
    const segments = location.pathname.split("/").filter(Boolean)
    const getPageTitle = (seg: string) => {
        switch (seg) {
            case "dashboard":
            case "home":
                return "Dashboard"
            case "documents":
                return "Knowledge Library"
            case "search":
                return "Semantic Search"
            case "chat":
                return "AI Workspace"
            case "admin":
                return "Administration"
            case "users":
                return "User Governance"
            case "role-requests":
                return "Role Requests"
            case "profile":
                return "User Profile"
            case "settings":
                return "Platform Settings"
            default:
                return seg.charAt(0).toUpperCase() + seg.slice(1)
        }
    }

    const currentTitle = segments.length > 0 ? getPageTitle(segments[segments.length - 1]) : "Dashboard"

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-md px-4 md:px-6">
            <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2 rounded-lg"
                onClick={toggleSidebar}
                aria-label="Open Navigation"
            >
                <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden md:flex items-center flex-1">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard" className="text-xs font-medium">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        {segments.length > 1 && (
                            <>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-xs font-medium text-muted-foreground">
                                        {getPageTitle(segments[0])}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                            </>
                        )}
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-xs font-semibold text-foreground">{currentTitle}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex items-center gap-3 ml-auto">
                {/* Global Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-56 md:w-72">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Ask EKA or search knowledge..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-1.5 text-xs bg-muted/40 border-border focus:bg-background shadow-none"
                    />
                    <Sparkles className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary/60 pointer-events-none" />
                </form>

                {/* Theme Switcher */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    aria-label="Toggle theme"
                >
                    {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
                </Button>

                {/* User Dropdown Menu */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="h-9 w-9 rounded-xl bg-primary/10 text-primary border border-border flex items-center justify-center font-bold text-xs hover:border-primary/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                        title={user?.full_name || "Account"}
                        aria-label="Account Menu"
                    >
                        {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150 z-50">
                            <div className="px-3 py-2 border-b border-border/60 mb-1">
                                <p className="text-xs font-semibold text-foreground truncate">
                                    {user?.full_name || "Enterprise User"}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                                <div className="mt-1.5">
                                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                        {user?.role || "Employee"}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-0.5 text-xs">
                                <Link
                                    to="/profile"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-foreground hover:bg-muted/70 transition-colors"
                                >
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>Profile Details</span>
                                </Link>
                                <Link
                                    to="/settings"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-foreground hover:bg-muted/70 transition-colors"
                                >
                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                    <span>Settings</span>
                                </Link>
                            </div>

                            <div className="pt-1 mt-1 border-t border-border/60">
                                <button
                                    onClick={() => {
                                        setMenuOpen(false)
                                        handleLogout()
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-xs font-medium"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
