import { PageHeader } from "../components/common/PageHeader"
import { EmptyState } from "../components/ui/EmptyState"
import { BarChart } from "lucide-react"

export default function Analytics() {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Analytics"
                description="Monitor system usage, token consumption, and response times."
            />
            <EmptyState
                icon={<BarChart className="h-8 w-8" />}
                title="Insufficient Data"
                description="Not enough queries have been processed to generate analytics."
            />
        </div>
    )
}
