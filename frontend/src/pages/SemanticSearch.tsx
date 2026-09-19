import React, { useState } from 'react';
import { retrievalService } from '../features/retrieval/services/retrievalService';
import type { SearchResponseData, SearchMetadata } from '../features/retrieval/services/retrievalService';
import { SemanticSearchResults } from '../features/retrieval/components/SemanticSearchResults';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/layout/Card';
import { PageHeader } from '../components/common/PageHeader';
import { Search } from 'lucide-react';

export const SemanticSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [topK, setTopK] = useState<number>(5);
    const [documentIdFilter, setDocumentIdFilter] = useState('');

    const [response, setResponse] = useState<SearchResponseData | null>(null);
    const [metadata, setMetadata] = useState<SearchMetadata | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!query.trim()) {
            setError("Query cannot be empty.");
            return;
        }

        if (topK < 1 || topK > 20) {
            setError("Top K must be between 1 and 20.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setHasSearched(true);
        setResponse(null);
        setMetadata(null);

        try {
            const apiRes = await retrievalService.search({
                query: query.trim(),
                top_k: topK,
                filters: documentIdFilter.trim() ? { document_id: documentIdFilter.trim() } : undefined
            });

            if (apiRes.success && apiRes.data) {
                setResponse(apiRes.data);
                if (apiRes.metadata) setMetadata(apiRes.metadata);
            } else {
                setError(apiRes.message || "Failed to retrieve results");
                if (apiRes.metadata) setMetadata(apiRes.metadata);
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred during search.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
            <PageHeader
                title="Search Knowledge"
                description="Retrieve relevant source passages and text chunks directly from your organization's indexed knowledge base."
            />

            {/* Search Input Card */}
            <Card className="border-border bg-card/80 shadow-sm">
                <CardContent className="p-5">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-foreground mb-1.5">
                                    Search Query
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Enter concept, policy question, or keywords to find matching chunks..."
                                        className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm placeholder:text-muted-foreground"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="w-full md:w-32">
                                <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center justify-between">
                                    <span>Top K</span>
                                    <span className="text-[11px] text-muted-foreground font-mono">1-20</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={topK}
                                    onChange={(e) => setTopK(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground text-center font-semibold focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="w-full md:w-56">
                                <label className="block text-xs font-semibold text-foreground mb-1.5">
                                    Document Filter (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={documentIdFilter}
                                    onChange={(e) => setDocumentIdFilter(e.target.value)}
                                    placeholder="Filter by Document ID..."
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm placeholder:text-muted-foreground text-xs"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="flex items-end">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="md"
                                    disabled={isLoading || !query.trim()}
                                    className="w-full md:w-auto h-[38px] px-5 gap-2 shadow-sm font-semibold"
                                >
                                    <Search className="w-4 h-4" />
                                    <span>{isLoading ? "Searching..." : "Retrieve"}</span>
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <SemanticSearchResults
                response={response}
                metadata={metadata}
                isLoading={isLoading}
                error={error}
                hasSearched={hasSearched}
            />
        </div>
    );
};
export default SemanticSearch;

