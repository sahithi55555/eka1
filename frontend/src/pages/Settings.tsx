import { PageHeader } from "../components/common/PageHeader"
import { EmptyState } from "../components/ui/EmptyState"
import { SettingsIcon } from "lucide-react"

export default function Settings() {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Settings"
                description="Configure your personal preferences and API keys."
            />
            <EmptyState
                icon={<SettingsIcon className="h-8 w-8" />}
                title="Configuration empty"
                description="No custom settings have been applied to your account."
            />
        </div>
    )
}
