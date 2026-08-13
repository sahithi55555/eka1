import React, { useState } from 'react';
import { SearchResultItem } from '../services/retrievalService';
import { FileText, File, Calendar, User, ChevronDown, ChevronUp } from 'lucide-react';

interface RetrievedChunkCardProps {
    result: SearchResultItem;
}

export const RetrievedChunkCard: React.FC<RetrievedChunkCardProps> = ({ result }) => {
    const [expanded, setExpanded] = useState(false);
    
    // display first 250 characters or full
    const charLimit = 250;
    const isLongStr = result.chunk_text.length > charLimit;
    const displayStr = expanded || !isLongStr ? result.chunk_text : result.chunk_text.substring(0, charLimit) + "...";

    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg dark:text-gray-100 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        {result.metadata.document_name || result.metadata.filename || "Unknown Document"}
                    </h3>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1"><File className="w-3 h-3" /> {result.metadata.file_type || 'Unknown'}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {result.metadata.uploaded_by || 'Unknown'}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {result.metadata.upload_date ? new Date(result.metadata.upload_date).toLocaleDateString() : 'Unknown'}</span>
                        <span className="font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">Chunk {result.chunk_index}</span>
                        <span>Pages {result.page_start}-{result.page_end}</span>
                    </div>
                </div>
                <div className="shrink-0 flex items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 font-bold px-3 py-1 text-sm shadow-sm border border-green-200 dark:border-green-800">
                    {(result.similarity_score * 100).toFixed(1)}% Match
                </div>
            </div>

            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md border border-gray-100 dark:border-gray-700/50">
                {displayStr}
            </div>
            
            {isLongStr && (
                <button 
                    onClick={() => setExpanded(!expanded)} 
                    className="self-start mt-1 flex items-center text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    {expanded ? (
                        <><ChevronUp className="w-3 h-3 mr-1" /> Collapse Full Text</>
                    ) : (
                        <><ChevronDown className="w-3 h-3 mr-1" /> Read More</>
                    )}
                </button>
            )}
            
            <div className="text-xs text-gray-400 dark:text-gray-500 text-right mt-1">
                {result.metadata.word_count} words • {result.metadata.character_count} chars
            </div>
        </div>
    );
};
