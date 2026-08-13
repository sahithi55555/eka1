import * as React from "react"
import { useEffect, useState } from "react"
import { authService } from "../../features/auth/services/authService"
import { NavLink } from "react-router-dom"
import {
    LayoutDashboard,
    MessageSquare,
    FileText,
    Search,
    BarChart,
    ShieldCheck,
    Settings,
    Hexagon,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { cn } from "../../utils/cn"

export const Sidebar = ({
    className,
    isCollapsed = false,
    onToggleCollapse
}: {
    className?: string,
    isCollapsed?: boolean,
    onToggleCollapse?: () => void
}) => {
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        authService.getCurrentUser()
            .then(user => { if (isMounted) setRole(user.role || "employee"); })
            .catch(() => { if (isMounted) setRole(null); });
        return () => { isMounted = false; };
    }, []);

    return (
        <aside className={cn(
            "flex h-screen flex-col border-r bg-background transition-all duration-300",
            isCollapsed ? "w-20" : "w-64",
            className
        )}>
            <div className={cn("flex h-16 shrink-0 items-center border-b px-4", isCollapsed ? "justify-center" : "justify-between")}>
                <div className="flex items-center overflow-hidden">
                    <Hexagon className="h-6 w-6 text-primary shrink-0" />
                    {!isCollapsed && <span className="ml-3 font-semibold tracking-tight whitespace-nowrap">EKA Platform</span>}
                </div>

                {onToggleCollapse && (
                    <button
                        onClick={onToggleCollapse}
                        className={cn(
                            "p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors shrink-0",
                            isCollapsed && "hidden"
                        )}
                        aria-label="Toggle Sidebar"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* If collapsed, show the expand button below the logo */}
            {isCollapsed && onToggleCollapse && (
                <div className="flex justify-center border-b p-2">
                    <button
                        onClick={onToggleCollapse}
                        className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                        aria-label="Expand Sidebar"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-6 px-3">
                    {role && (
                        <div>
                            <SidebarLink to={`/${role}/dashboard`} icon={<LayoutDashboard />} isCollapsed={isCollapsed}>
                                Dashboard
                            </SidebarLink>
                        </div>
                    )}
                    <div>
                        {!isCollapsed && <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Knowledge</h4>}
                        {isCollapsed && <div className="h-6 mx-auto w-8 border-b mb-2 border-border/50"></div>}
                        <div className="space-y-1">
                            <SidebarLink to="/chat" icon={<MessageSquare />} isCollapsed={isCollapsed}>Chat</SidebarLink>
                            <SidebarLink to="/documents" icon={<FileText />} isCollapsed={isCollapsed}>Documents</SidebarLink>
                            <SidebarLink to="/search" icon={<Search />} isCollapsed={isCollapsed}>Semantic Search</SidebarLink>
                        </div>
                    </div>
                    {(role === "admin" || role === "manager") && (
                        <div>
                            {!isCollapsed && <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Administration</h4>}
                            {isCollapsed && <div className="h-6 mx-auto w-8 border-b mb-2 border-border/50"></div>}
                            <div className="space-y-1">
                                <SidebarLink to="/analytics" icon={<BarChart />} isCollapsed={isCollapsed}>Analytics</SidebarLink>
                                {role === "admin" && (
                                    <SidebarLink to="/admin" icon={<ShieldCheck />} isCollapsed={isCollapsed}>Admin</SidebarLink>
                                )}
                            </div>
                        </div>
                    )}
                    {role === "admin" && (
                        <div>
                            {!isCollapsed && <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">System</h4>}
                            {isCollapsed && <div className="h-6 mx-auto w-8 border-b mb-2 border-border/50"></div>}
                            <div className="space-y-1">
                                <SidebarLink to="/settings" icon={<Settings />} isCollapsed={isCollapsed}>Settings</SidebarLink>
                            </div>
                        </div>
                    )}
                </nav>
            </div>
        </aside>
    )
}

function SidebarLink({ to, icon, children, isCollapsed }: { to: string, icon: React.ReactNode, children: React.ReactNode, isCollapsed?: boolean }) {
    return (
        <NavLink
            to={to}
            title={isCollapsed ? (typeof children === 'string' ? children : undefined) : undefined}
            className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                isCollapsed ? "justify-center" : "justify-start"
            )}
        >
            <span className="[&>svg]:h-5 [&>svg]:w-5 flex shrink-0">{icon}</span>
            {!isCollapsed && <span className="truncate">{children}</span>}
        </NavLink>
    )
}
