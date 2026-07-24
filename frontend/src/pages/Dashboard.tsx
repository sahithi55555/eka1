import { PageHeader } from "../components/common/PageHeader"
import { EmptyState } from "../components/ui/EmptyState"
import { LayoutDashboard } from "lucide-react"

export default function Dashboard() {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Dashboard"
                description="Welcome to the Enterprise Knowledge Assistant."
            />
            <EmptyState
                icon={<LayoutDashboard className="h-8 w-8" />}
                title="No Data Available"
                description="Your dashboard widgets will appear here once configured."
            />
        </div>
    )
}
