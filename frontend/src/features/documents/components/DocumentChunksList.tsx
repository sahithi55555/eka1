import React, { useState } from "react";
import type { DocumentChunk } from "../services/documentService";

interface DocumentChunksListProps {
    chunks: DocumentChunk[];
}

export const DocumentChunksList: React.FC<DocumentChunksListProps> = ({ chunks }) => {
    if (chunks.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Extracted Chunks</h3>
            <div className="space-y-4">
                {chunks.map((chunk) => (
                    <ChunkCard key={chunk.id} chunk={chunk} />
                ))}
            </div>
        </div>
    );
};

const ChunkCard: React.FC<{ chunk: DocumentChunk }> = ({ chunk }) => {
    const [expanded, setExpanded] = useState(false);
    
    // Only display 200-250 characters as requested
    const previewLength = 250;
    const isLong = chunk.text.length > previewLength;
    const displayText = expanded ? chunk.text : chunk.text.substring(0, previewLength) + (isLong ? "..." : "");

    return (
        <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <div className="flex space-x-3 items-center">
                    <span className="font-mono text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-300">
                        #{chunk.chunk_index}
                    </span>
                    <span className="text-xs text-gray-400">
                        Pages: {chunk.metadata.page_start} - {chunk.metadata.page_end}
                    </span>
                </div>
                <div className="flex space-x-4 text-xs text-gray-400">
                    <span>{chunk.word_count} words</span>
                    <span>{chunk.character_count} chars</span>
                </div>
            </div>
            
            <div className="mt-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-serif">
                {displayText}
            </div>
            
            {isLong && (
                <button 
                    onClick={() => setExpanded(!expanded)}
                    className="mt-2 text-xs font-medium text-primary hover:underline focus:outline-none"
                >
                    {expanded ? "Read Less" : "Read More"}
                </button>
            )}
        </div>
    );
};
