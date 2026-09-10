import React from 'react';
import type { SearchResponseData, SearchMetadata } from '../services/retrievalService';
import { RetrievedChunkCard } from './RetrievedChunkCard';
import { Activity, Search, Clock, Layers, AlertCircle } from 'lucide-react';

interface SemanticSearchResultsProps {
    response: SearchResponseData | null;
    metadata: SearchMetadata | null;
    isLoading: boolean;
    error: string | null;
    hasSearched: boolean;
}

export const SemanticSearchResults: React.FC<SemanticSearchResultsProps> = ({
    response, metadata, isLoading, error, hasSearched
}) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card/40 rounded-xl border border-border">
                <div className="animate-spin mb-3">
                    <Activity className="w-7 h-7 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">Querying Vector Embeddings Index...</p>
                <p className="text-xs text-muted-foreground mt-1">Comparing cosine similarity against ChromaDB vectors</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-destructive/10 text-destructive p-5 rounded-xl border border-destructive/30 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 font-bold text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Retrieval Failed</span>
                </div>
                <p className="text-xs">{error}</p>
            </div>
        );
    }

    if (!hasSearched) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card/40 rounded-xl border border-dashed border-border space-y-2">
                <Search className="w-10 h-10 text-muted-foreground/40 mb-1" />
                <p className="font-semibold text-sm text-foreground">Direct Vector Retrieval</p>
                <p className="text-xs max-w-sm text-center text-muted-foreground">
                    Enter a question or topic above to semantically extract the highest ranking chunks from your indexed enterprise documents.
                </p>
            </div>
        );
    }

    if (response && response.results.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 bg-card/40 rounded-xl border border-dashed border-border space-y-2">
                <Search className="w-9 h-9 text-muted-foreground/40 mb-1" />
                <p className="font-semibold text-sm text-foreground">No Matching Chunks Found</p>
                <p className="text-xs text-muted-foreground max-w-sm text-center">
                    No document chunks matched above the similarity threshold. Try broadening your search query or uploading relevant documents.
                </p>

                {metadata && (
                    <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs bg-muted/40 p-2.5 rounded-lg border border-border">
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Layers className="w-3 h-3 text-primary" /> Chunks Searched: {metadata.total_chunks_searched}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3 text-primary" /> Latency: {metadata.retrieval_time_ms}ms
                        </span>
                    </div>
                )}
            </div>
        );
    }

    if (!response) return null;

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 bg-muted/30 rounded-xl border border-border gap-2.5">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    <span>Showing Top {response.total_results} matching chunks</span>
                </span>

                {metadata && (
                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3" /> {metadata.embedding_time_ms}ms embed
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Search className="w-3 h-3" /> {metadata.vector_search_time_ms}ms vector search
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-foreground bg-background px-2 py-0.5 rounded-md border border-border">
                            {metadata.retrieval_time_ms}ms total
                        </span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {response.results.map((result) => (
                    <RetrievedChunkCard key={result.chunk_id} result={result} />
                ))}
            </div>
        </div>
    );
};
