import { Link } from 'react-router-dom';
import type { Citation } from '../services/chatService';
import { FileText, ExternalLink, Hash } from 'lucide-react';

interface CitationCardProps {
  citation: Citation;
}

export function CitationCard({ citation }: CitationCardProps) {
  const pageLabel = citation.page_start === citation.page_end
    ? `Page ${citation.page_start}`
    : `Pages ${citation.page_start}–${citation.page_end}`;

  return (
    <div className="text-xs bg-muted/40 hover:bg-muted/70 border border-border rounded-xl p-3.5 flex flex-col justify-between gap-2 transition-all group">
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="font-semibold text-foreground flex items-center gap-1.5 truncate">
            <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate" title={citation.document_name}>
              {citation.document_name}
            </span>
          </div>

          <Link
            to="/documents"
            className="text-muted-foreground hover:text-primary transition-colors p-1 rounded shrink-0 opacity-0 group-hover:opacity-100"
            title="Inspect in Knowledge Library"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1 font-medium">
          <span className="px-1.5 py-0.5 rounded bg-background border border-border/80 text-[10px]">
            {pageLabel}
          </span>
          <span className="flex items-center gap-0.5 text-[10px]">
            <Hash className="w-2.5 h-2.5" /> Chunk {citation.chunk_index}
          </span>
        </div>
      </div>

      {citation.text_preview && (
        <div className="text-muted-foreground text-[11px] leading-relaxed italic bg-background/60 p-2 rounded-lg border border-border/50 line-clamp-3">
          "{citation.text_preview}"
        </div>
      )}
    </div>
  );
}

