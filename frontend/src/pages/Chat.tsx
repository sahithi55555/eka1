
import { Container } from "../components/layout/Container"
import { EmptyState } from "../components/ui/EmptyState"
import { MessageSquare } from "lucide-react"

export default function Chat() {
    return (
        <Container className="py-8 flex-1 h-full flex flex-col">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Knowledge Chat</h1>
                <p className="text-muted-foreground">Interact with your AI assistants here.</p>
            </div>
            <EmptyState
                className="flex-1"
                icon={<MessageSquare className="h-8 w-8" />}
                title="Chat Interface Coming Soon"
                description="Knowledge agents are currently being constructed."
            />
        </Container>
    )
}
