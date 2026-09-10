import * as React from "react"
import { useEffect, useState } from "react"
import { authService } from "../../features/auth/services/authService"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import {
    LayoutDashboard,
    MessageSquare,
    FileText,
    Search,
    ShieldCheck,
    Users,
    UserCheck,
    User,
    Settings,
    Hexagon,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Sparkles
} from "lucide-react"
import { cn } from "../../utils/cn"

interface UserProfile {
    id?: string
    full_name?: string
    email?: string
    role?: string
    designation?: string
    department?: string
}

export const Sidebar = ({
    className,
    isCollapsed = false,
    onToggleCollapse
}: {
    className?: string,
    isCollapsed?: boolean,
    onToggleCollapse?: () => void
}) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;
        authService.getCurrentUser()
            .then(userData => {
                if (isMounted) {
                    setUser(userData);
                    if (userData.role === "admin") {
                        authService.getRoleRequests("pending")
                            .then(reqs => {
                                if (isMounted && Array.isArray(reqs)) {
                                    setPendingRequestsCount(reqs.length);
                                }
                            })
                            .catch(() => {});
                    }
                }
            })
            .catch(() => {
                if (isMounted) setUser(null);
            });
        return () => { isMounted = false; };
    }, [location.pathname]);

    const handleLogout = () => {
        authService.logout();
        navigate("/login");
    };

    const role = user?.role || "employee";
    const isAdmin = role === "admin";

    return (
        <aside className={cn(
            "flex h-screen flex-col border-r border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 transition-all duration-300 select-none z-20",
            isCollapsed ? "w-20" : "w-64",
            className
        )}>
            {/* Brand Header */}
            <div className={cn(
                "flex h-16 shrink-0 items-center border-b border-border px-4",
                isCollapsed ? "justify-center" : "justify-between"
            )}>
                <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden group">
                    <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                        <Hexagon className="h-5 w-5 fill-current" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-base tracking-tight text-foreground flex items-center gap-1.5">
                                EKA
                                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                    AI
                                </span>
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate -mt-0.5">
                                Enterprise Knowledge
                            </span>
                        </div>
                    )}
                </NavLink>

                {onToggleCollapse && !isCollapsed && (
                    <button
                        onClick={onToggleCollapse}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        aria-label="Collapse Sidebar"
                        title="Collapse Sidebar"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Expand button when collapsed */}
            {isCollapsed && onToggleCollapse && (
                <div className="flex justify-center border-b border-border py-2">
                    <button
                        onClick={onToggleCollapse}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Expand Sidebar"
                        title="Expand Sidebar"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Navigation Sections */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                {/* SECTION: HOME */}
                <div>
                    {!isCollapsed && (
                        <h4 className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                            Home
                        </h4>
                    )}
                    <div className="space-y-1">
                        <SidebarLink to="/dashboard" icon={<LayoutDashboard />} isCollapsed={isCollapsed}>
                            Dashboard
                        </SidebarLink>
                    </div>
                </div>

                {/* SECTION: KNOWLEDGE */}
                <div>
                    {!isCollapsed && (
                        <h4 className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                            Knowledge
                        </h4>
                    )}
                    <div className="space-y-1">
                        <SidebarLink to="/documents" icon={<FileText />} isCollapsed={isCollapsed}>
                            Knowledge Library
                        </SidebarLink>
                        <SidebarLink to="/search" icon={<Search />} isCollapsed={isCollapsed}>
                            Semantic Search
                        </SidebarLink>
                    </div>
                </div>

                {/* SECTION: WORKSPACE */}
                <div>
                    {!isCollapsed && (
                        <h4 className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 flex items-center justify-between">
                            <span>Workspace</span>
                            <Sparkles className="h-3 w-3 text-primary" />
                        </h4>
                    )}
                    <div className="space-y-1">
                        <SidebarLink to="/chat" icon={<MessageSquare />} isCollapsed={isCollapsed}>
                            Chat
                        </SidebarLink>
                    </div>
                </div>

                {/* SECTION: ADMINISTRATION (Admin Only) */}
                {isAdmin && (
                    <div>
                        {!isCollapsed && (
                            <h4 className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                                <span>Administration</span>
                            </h4>
                        )}
                        {isCollapsed && <div className="h-px mx-auto w-8 bg-border my-2" />}
                        <div className="space-y-1">
                            <SidebarLink to="/admin/users" icon={<Users />} isCollapsed={isCollapsed}>
                                Users
                            </SidebarLink>
                            <SidebarLink
                                to="/admin/role-requests"
                                icon={<UserCheck />}
                                isCollapsed={isCollapsed}
                                badge={pendingRequestsCount > 0 ? pendingRequestsCount : undefined}
                            >
                                Role Requests
                            </SidebarLink>
                        </div>
                    </div>
                )}

                {/* SECTION: ACCOUNT */}
                <div>
                    {!isCollapsed && (
                        <h4 className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                            Account
                        </h4>
                    )}
                    {isCollapsed && <div className="h-px mx-auto w-8 bg-border my-2" />}
                    <div className="space-y-1">
                        <SidebarLink to="/profile" icon={<User />} isCollapsed={isCollapsed}>
                            Profile
                        </SidebarLink>
                        <SidebarLink to="/settings" icon={<Settings />} isCollapsed={isCollapsed}>
                            Settings
                        </SidebarLink>
                    </div>
                </div>
            </div>

            {/* User Profile Footer */}
            <div className="p-3 border-t border-border mt-auto shrink-0 bg-card">
                {isCollapsed ? (
                    <div className="flex flex-col items-center gap-2">
                        <button
                            onClick={() => navigate("/profile")}
                            title={user?.full_name || "Profile"}
                            className="h-9 w-9 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center font-semibold text-xs border border-border"
                        >
                            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                        </button>
                        <button
                            onClick={handleLogout}
                            title="Sign out"
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-muted/40 border border-border/50">
                        <NavLink
                            to="/profile"
                            className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity"
                        >
                            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-foreground truncate">
                                    {user?.full_name || "Enterprise User"}
                                </span>
                                <span className="text-[10px] text-muted-foreground truncate capitalize">
                                    {user?.designation || role}
                                </span>
                            </div>
                        </NavLink>

                        <button
                            onClick={handleLogout}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                            title="Sign out"
                            aria-label="Sign out"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
        </aside>
    )
}

function SidebarLink({
    to,
    icon,
    children,
    isCollapsed,
    badge
}: {
    to: string,
    icon: React.ReactNode,
    children: React.ReactNode,
    isCollapsed?: boolean,
    badge?: number | string
}) {
    return (
        <NavLink
            to={to}
            title={isCollapsed ? (typeof children === 'string' ? children : undefined) : undefined}
            className={({ isActive }) => cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive
                    ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                isCollapsed ? "justify-center px-0" : "justify-start"
            )}
        >
            <span className="[&>svg]:h-4 [&>svg]:w-4 flex shrink-0">{icon}</span>
            {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 truncate">
                    <span className="truncate">{children}</span>
                    {badge !== undefined && (
                        <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white dark:bg-amber-600">
                            {badge}
                        </span>
                    )}
                </div>
            )}
            {isCollapsed && badge !== undefined && (
                <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-amber-500" />
            )}
        </NavLink>
    )
}
