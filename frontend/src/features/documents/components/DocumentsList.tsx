import React, { useState } from "react";
import { FileText, Trash2, Search as SearchIcon, File as FileGeneric } from "lucide-react";
import type { Document } from "../services/documentService";
import { Card, CardContent } from "../../../components/layout/Card";
import { Button } from "../../../components/ui/Button";

interface DocumentsListProps {
    documents: Document[];
    onDelete: (id: string) => Promise<void>;
    onSelect: (doc: Document) => void;
}

export const DocumentsList: React.FC<DocumentsListProps> = ({ documents, onDelete, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filtered = documents.filter(doc =>
        doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getFileIcon = (fileType: string) => {
        if (fileType.includes("pdf")) return <FileText className="text-red-500 h-6 w-6" />;
        if (fileType.includes("document") || fileType.includes("word")) return <FileText className="text-blue-600 h-6 w-6" />;
        if (fileType.includes("text")) return <FileText className="text-gray-500 h-6 w-6" />;
        return <FileGeneric className="text-gray-400 h-6 w-6" />;
    };

    return (
        <div className="space-y-4">
            <div className="relative mb-6">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search documents by filename..."
                    className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed">
                    <p className="text-gray-500 dark:text-gray-400">No documents found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(doc => (
                        <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect(doc)}>
                            <CardContent className="p-4 flex flex-col h-full">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3 w-[80%]">
                                        <div className="shrink-0 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                                            {getFileIcon(doc.file_type)}
                                        </div>
                                        <div className="overflow-hidden">
                                            <h4 className="font-semibold text-sm truncate dark:text-gray-200" title={doc.filename}>
                                                {doc.filename}
                                            </h4>
                                            <p className="text-xs text-gray-500">{(doc.file_size / 1024 / 1024).toFixed(3)} MB</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="h-8 w-8 !p-0 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm("Delete this document?")) onDelete(doc.id);
                                        }}
                                        aria-label="Delete document"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                        ${doc.status === 'Ready' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                            doc.status === 'Processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                doc.status === 'Failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}
                                    >
                                        {doc.status}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(doc.uploaded_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
