
import { Container } from "../components/layout/Container"
import { EmptyState } from "../components/ui/EmptyState"
import { Settings as SettingsIcon } from "lucide-react"

export default function Settings() {
    return (
        <Container className="py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Update your user profile and application preferences.</p>
            </div>
            <EmptyState
                icon={<SettingsIcon className="h-8 w-8" />}
                title="Settings & Preferences"
                description="Profile configurations panel coming soon."
            />
        </Container>
    )
}
