import React, { useState } from "react";
import { Search, Layers, FileText, ChevronDown, ChevronUp } from "lucide-react";
import type { DocumentChunk } from "../services/documentService";

interface DocumentChunksListProps {
    chunks: DocumentChunk[];
}

export const DocumentChunksList: React.FC<DocumentChunksListProps> = ({ chunks }) => {
    const [chunkSearch, setChunkSearch] = useState("");

    if (chunks.length === 0) return null;

    const filteredChunks = chunks.filter((c) => {
        if (!chunkSearch.trim()) return true;
        const q = chunkSearch.toLowerCase();
        const matchesText = c.text.toLowerCase().includes(q);
        const matchesPage =
            String(c.metadata?.page_start || "").includes(q) ||
            String(c.metadata?.page_end || "").includes(q);
        const matchesIndex = String(c.chunk_index).includes(q);
        return matchesText || matchesPage || matchesIndex;
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    <h3 className="text-base font-semibold text-foreground">
                        Extracted Document Chunks ({chunks.length})
                    </h3>
                </div>

                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search within chunks..."
                        value={chunkSearch}
                        onChange={(e) => setChunkSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground shadow-sm"
                    />
                </div>
            </div>

            {filteredChunks.length === 0 ? (
                <div className="p-6 text-center bg-card/40 rounded-lg border border-border text-xs text-muted-foreground">
                    No chunks matching "{chunkSearch}".
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredChunks.map((chunk) => (
                        <ChunkCard key={chunk.id || `${chunk.document_id}-${chunk.chunk_index}`} chunk={chunk} />
                    ))}
                </div>
            )}
        </div>
    );
};

const ChunkCard: React.FC<{ chunk: DocumentChunk }> = ({ chunk }) => {
    const [expanded, setExpanded] = useState(false);

    // Initial 200-250 characters preview
    const previewLength = 220;
    const isLong = chunk.text.length > previewLength;
    const displayText = expanded
        ? chunk.text
        : chunk.text.substring(0, previewLength) + (isLong ? "..." : "");

    return (
        <div className="p-4 rounded-xl border border-border bg-card/60 hover:bg-card/90 transition-colors space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-md">
                        #{chunk.chunk_index}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                        <FileText className="h-3 w-3" />
                        Pages: {chunk.metadata?.page_start ?? 1} - {chunk.metadata?.page_end ?? 1}
                    </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{chunk.word_count} words</span>
                    <span>•</span>
                    <span>{chunk.character_count} chars</span>
                </div>
            </div>

            <div className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap font-sans bg-background/50 p-3 rounded-lg border border-border/40">
                {displayText}
            </div>

            {isLong && (
                <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                    <span>{expanded ? "Collapse text" : "Read full chunk"}</span>
                    {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
            )}
        </div>
    );
};

