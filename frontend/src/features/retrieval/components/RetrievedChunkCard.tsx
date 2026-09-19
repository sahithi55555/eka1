import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { SearchResultItem } from '../services/retrievalService';
import { FileText, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface RetrievedChunkCardProps {
    result: SearchResultItem;
}

export const RetrievedChunkCard: React.FC<RetrievedChunkCardProps> = ({ result }) => {
    const [expanded, setExpanded] = useState(false);

    // display first 220-250 characters or full
    const charLimit = 220;
    const isLongStr = result.chunk_text.length > charLimit;
    const displayStr = expanded || !isLongStr ? result.chunk_text : result.chunk_text.substring(0, charLimit) + "...";

    const scorePercent = (result.similarity_score * 100).toFixed(1);

    return (
        <div className="bg-card/70 hover:bg-card/90 p-5 rounded-xl border border-border shadow-sm flex flex-col gap-3 transition-colors group">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate max-w-md">
                            {result.metadata.document_name || result.metadata.filename || "Document"}
                        </span>
                        <Link
                            to="/documents"
                            className="text-muted-foreground hover:text-primary transition-colors p-1 rounded opacity-0 group-hover:opacity-100"
                            title="Inspect in Knowledge Library"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                    </h3>
                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            Chunk #{result.chunk_index}
                        </span>
                        <span>•</span>
                        <span>Pages {result.page_start}–{result.page_end}</span>
                        <span>•</span>
                        <span className="truncate max-w-[120px]">{result.metadata.file_type || 'Document'}</span>
                    </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span>{scorePercent}% Match</span>
                    </span>
                </div>
            </div>

            <div className="text-xs leading-relaxed text-foreground whitespace-pre-wrap bg-background/60 p-3.5 rounded-lg border border-border/50 font-sans">
                {displayStr}
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
                {isLongStr ? (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline transition-colors"
                    >
                        {expanded ? (
                            <><ChevronUp className="w-3.5 h-3.5" /> Collapse Full Text</>
                        ) : (
                            <><ChevronDown className="w-3.5 h-3.5" /> Read Full Chunk</>
                        )}
                    </button>
                ) : <span />}

                <div className="text-[11px] text-muted-foreground">
                    {result.metadata.word_count} words • {result.metadata.character_count} chars
                </div>
            </div>
        </div>
    );
};
