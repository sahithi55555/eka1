import * as React from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { TopNav } from "./TopNav"
import { Drawer } from "../ui/Drawer"

export const AppLayout = () => {
    const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false)
    const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = React.useState(false)
    const location = useLocation()

    // Auto close mobile sidebar on route change
    React.useEffect(() => {
        setMobileSidebarOpen(false)
    }, [location.pathname])

    return (
        <div className="flex min-h-screen w-full bg-background">
            {/* Desktop Sidebar */}
            <Sidebar
                className="hidden md:flex"
                isCollapsed={desktopSidebarCollapsed}
                onToggleCollapse={() => setDesktopSidebarCollapsed(!desktopSidebarCollapsed)}
            />

            {/* Mobile Sidebar overlay */}
            <Drawer
                open={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
                side="left"
                className="w-64 p-0 sm:max-w-[16rem]"
            >
                <Sidebar className="h-full w-full border-r-0" />
            </Drawer>

            <div className="flex flex-1 flex-col overflow-hidden">
                <TopNav toggleSidebar={() => setMobileSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto bg-muted/20">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
