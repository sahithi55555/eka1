import { PageHeader } from "../components/common/PageHeader"
import { EmptyState } from "../components/ui/EmptyState"
import { SearchIcon } from "lucide-react"

export default function Search() {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Semantic Search"
                description="Directly query the vector database without LLM augmentation."
            />
            <EmptyState
                icon={<SearchIcon className="h-8 w-8" />}
                title="Search index ready"
                description="Enter a query to find semantically matching document chunks."
            />
        </div>
    )
}
