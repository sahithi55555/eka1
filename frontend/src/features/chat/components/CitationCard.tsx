import type { Citation } from '../services/chatService';
import { FileText } from 'lucide-react';

interface CitationCardProps {
  citation: Citation;
}

export function CitationCard({ citation }: CitationCardProps) {
  const pageLabel = citation.page_start === citation.page_end
    ? `Page ${citation.page_start}`
    : `Pages ${citation.page_start}-${citation.page_end}`;

  return (
    <div className="text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-3 mb-2 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
      <div className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
        <FileText className="w-3.5 h-3.5" />
        {citation.source_id || 'Source'} - {citation.document_name}
      </div>
      <div className="text-gray-500 dark:text-gray-400 mt-1">
        {pageLabel} | Chunk: {citation.chunk_index}
      </div>
      {citation.text_preview && (
        <div className="text-gray-700 dark:text-gray-300 mt-1.5 italic line-clamp-3">
          "{citation.text_preview}"
        </div>
      )}
    </div>
  );
}
