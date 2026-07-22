
import { Container } from "../components/layout/Container"
import { EmptyState } from "../components/ui/EmptyState"
import { ShieldCheck } from "lucide-react"

export default function Admin() {
    return (
        <Container className="py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
                <p className="text-muted-foreground">Manage organizational users and security roles.</p>
            </div>
            <EmptyState
                icon={<ShieldCheck className="h-8 w-8" />}
                title="Admin Portal"
                description="Authorization settings are strictly locked."
            />
        </Container>
    )
}
