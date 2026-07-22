
import { Container } from "../components/layout/Container"
import { EmptyState } from "../components/ui/EmptyState"
import { LayoutDashboard } from "lucide-react"

export default function Dashboard() {
    return (
        <Container className="py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your enterprise knowledge system.</p>
            </div>
            <EmptyState
                icon={<LayoutDashboard className="h-8 w-8" />}
                title="Welcome to EKA"
                description="Your dashboard widgets will appear here."
            />
        </Container>
    )
}
