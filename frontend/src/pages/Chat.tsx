import { PageHeader } from "../components/common/PageHeader"
import { EmptyState } from "../components/ui/EmptyState"
import { MessageSquare } from "lucide-react"
import { Button } from "../components/ui/Button"

export default function Chat() {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Chat Interface"
                description="Interact with the enterprise knowledge base."
                actions={<Button>New Chat</Button>}
            />
            <EmptyState
                icon={<MessageSquare className="h-8 w-8" />}
                title="No active conversations"
                description="Start a new chat to begin asking questions against your documents."
            />
        </div>
    )
}
