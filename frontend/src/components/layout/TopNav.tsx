
import { Bell, Search as SearchIcon, Sun, Moon, Menu } from "lucide-react"
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
import { useLocation } from "react-router-dom"

export const TopNav = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
    const { theme, setTheme } = useTheme()
    const location = useLocation()
    const path = location.pathname.split("/").filter(Boolean)[0] || "Dashboard"
    const title = path.charAt(0).toUpperCase() + path.slice(1)

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
            <Button variant="ghost" size="sm" className="md:hidden px-2" onClick={toggleSidebar}>
                <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden md:flex items-center flex-1">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex items-center gap-4 ml-auto md:ml-0">
                <div className="relative hidden w-64 md:block">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search..." className="w-full pl-9 bg-muted/50" />
                </div>

                <Button variant="ghost" size="sm" className="px-2">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="px-2"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    {theme === "dark" ? <Sun className="h-5 w-5 text-muted-foreground" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
                </Button>

                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center border cursor-pointer shrink-0">
                    <span className="text-sm font-medium">U</span>
                </div>
            </div>
        </header>
    )
}
