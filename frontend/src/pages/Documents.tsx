
import { Container } from "../components/layout/Container"
import { EmptyState } from "../components/ui/EmptyState"
import { FileText } from "lucide-react"

export default function Documents() {
    return (
        <Container className="py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                <p className="text-muted-foreground">Manage and inject text corpus into your organization's context.</p>
            </div>
            <EmptyState
                icon={<FileText className="h-8 w-8" />}
                title="No Documents Uploaded"
                description="Drag and drop documents here to begin."
            />
        </Container>
    )
}
