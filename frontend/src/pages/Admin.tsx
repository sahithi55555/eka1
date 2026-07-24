import { PageHeader } from "../components/common/PageHeader"
import { EmptyState } from "../components/ui/EmptyState"
import { ShieldCheck } from "lucide-react"

export default function Admin() {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Admin Control"
                description="Manage user roles, access policies, and prompt templates."
            />
            <EmptyState
                icon={<ShieldCheck className="h-8 w-8" />}
                title="Access Restricted"
                description="Only system administrators can configure global settings."
            />
        </div>
    )
}
