
import { Container } from "../components/layout/Container"
import { EmptyState } from "../components/ui/EmptyState"
import { BarChart } from "lucide-react"

export default function Analytics() {
    return (
        <Container className="py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground">Traffic, usage, and cost monitoring.</p>
            </div>
            <EmptyState
                icon={<BarChart className="h-8 w-8" />}
                title="Analytics Dashboard"
                description="Data rendering integration coming soon."
            />
        </Container>
    )
}
