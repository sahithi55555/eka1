import * as React from "react"
import { NavLink } from "react-router-dom"
import {
    LayoutDashboard,
    MessageSquare,
    FileText,
    Search,
    BarChart,
    ShieldCheck,
    Settings,
    Hexagon
} from "lucide-react"
import { cn } from "../../utils/cn"

export const Sidebar = ({ className }: { className?: string }) => {
    return (
        <aside className={cn("flex h-screen w-64 flex-col border-r bg-background", className)}>
            <div className="flex h-16 shrink-0 items-center border-b px-6">
                <Hexagon className="h-6 w-6 text-primary" />
                <span className="ml-3 font-semibold tracking-tight">EKA Platform</span>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-6 px-4">
                    <div>
                        <SidebarLink to="/dashboard" icon={<LayoutDashboard />}>Dashboard</SidebarLink>
                    </div>
                    <div>
                        <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Knowledge</h4>
                        <div className="space-y-1">
                            <SidebarLink to="/chat" icon={<MessageSquare />}>Chat</SidebarLink>
                            <SidebarLink to="/documents" icon={<FileText />}>Documents</SidebarLink>
                            <SidebarLink to="/search" icon={<Search />}>Search</SidebarLink>
                        </div>
                    </div>
                    <div>
                        <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Administration</h4>
                        <div className="space-y-1">
                            <SidebarLink to="/analytics" icon={<BarChart />}>Analytics</SidebarLink>
                            <SidebarLink to="/admin" icon={<ShieldCheck />}>Admin</SidebarLink>
                        </div>
                    </div>
                    <div>
                        <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">System</h4>
                        <div className="space-y-1">
                            <SidebarLink to="/settings" icon={<Settings />}>Settings</SidebarLink>
                        </div>
                    </div>
                </nav>
            </div>
        </aside>
    )
}

function SidebarLink({ to, icon, children }: { to: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground flex-row w-full",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
        >
            <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
            <span>{children}</span>
        </NavLink>
    )
}
