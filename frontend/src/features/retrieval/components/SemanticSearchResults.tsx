import React from 'react';
import { SearchResponseData, SearchMetadata } from '../services/retrievalService';
import { RetrievedChunkCard } from './RetrievedChunkCard';
import { Activity, Search, Clock, List } from 'lucide-react';

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
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="animate-spin mb-4">
                    <Activity className="w-8 h-8 text-primary" />
                </div>
                <p>Querying ChromaDB Vector Index...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-6 rounded-lg border border-red-200 dark:border-red-800 text-center">
                <p className="font-bold mb-2">Retrieval Failed</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }
    
    if (!hasSearched) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <Search className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600" />
                <p className="font-medium text-lg text-gray-600 dark:text-gray-400">Semantic Search Area</p>
                <p className="text-sm mt-1 max-w-sm text-center">Enter a query above to semantically retrieve the most relevant chunks across your entire knowledge base.</p>
            </div>
        );
    }
    
    if (response && response.results.length === 0) {
        return (
            <div className="flex flex-col flex-grow items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                <Search className="w-10 h-10 mb-4 text-gray-300 dark:text-gray-600" />
                <p className="font-medium text-lg">No Results Found</p>
                <p className="text-sm mt-1">Try rewording your query or lowering the similarity threshold.</p>
                
                {metadata && (
                     <div className="mt-8 flex gap-4 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                     <span className="flex items-center gap-1"><List className="w-3 h-3" /> Indexed: {metadata.total_chunks_searched} chunks</span>
                     <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Vectors Time: {metadata.vector_search_time_ms}ms</span>
                     <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Total Time: {metadata.retrieval_time_ms}ms</span>
                 </div>
                )}
            </div>
        );
    }

    if (!response) return null;

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-700/50 gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Showing Top {response.total_results} matching chunks
                </span>
                
                {metadata && (
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1" title="Embedding Time"><Activity className="w-3 h-3" /> {metadata.embedding_time_ms}ms embed scale</span>
                        <span className="flex items-center gap-1" title="Vector DB Search Time"><Search className="w-3 h-3" /> {metadata.vector_search_time_ms}ms chroma</span>
                        <span className="font-medium flex items-center gap-1 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 px-2 py-1 rounded shadow-sm border border-gray-200 dark:border-gray-600"><Clock className="w-3 h-3 text-primary" /> {metadata.retrieval_time_ms}ms total latency</span>
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 gap-6">
                {response.results.map((result) => (
                    <RetrievedChunkCard key={result.chunk_id} result={result} />
                ))}
            </div>
        </div>
    );
};
