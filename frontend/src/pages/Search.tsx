
import { Container } from "../components/layout/Container"
import { EmptyState } from "../components/ui/EmptyState"
import { SearchIcon } from "lucide-react"

export default function Search() {
    return (
        <Container className="py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Global Search</h1>
                <p className="text-muted-foreground">Find information across all enterprise indices.</p>
            </div>
            <EmptyState
                icon={<SearchIcon className="h-8 w-8" />}
                title="Search Portal"
                description="Search integration is under active development."
            />
        </Container>
    )
}
