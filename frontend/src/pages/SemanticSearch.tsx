import React, { useState } from 'react';
import { retrievalService } from '../features/retrieval/services/retrievalService';
import type { SearchResponseData, SearchMetadata } from '../features/retrieval/services/retrievalService';
import { SemanticSearchResults } from '../features/retrieval/components/SemanticSearchResults';
import { Button } from '../components/ui/Button';
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
                query,
                top_k: topK,
                filters: documentIdFilter ? { document_id: documentIdFilter } : undefined
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
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b dark:border-gray-800">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Semantic Search</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Query your knowledge base directly over the Vector Database.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Search Query
                        </label>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask a question or enter keywords..."
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="w-full md:w-32">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Top K
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            value={topK}
                            onChange={(e) => setTopK(parseInt(e.target.value) || 5)}
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Document ID Filter
                        </label>
                        <input
                            type="text"
                            value={documentIdFilter}
                            onChange={(e) => setDocumentIdFilter(e.target.value)}
                            placeholder="Optional ID..."
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex items-end">
                        <Button type="submit" disabled={isLoading} className="w-full gap-2 h-10">
                            <Search className="w-4 h-4" />
                            Retrieve
                        </Button>
                    </div>
                </div>
            </form>

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
