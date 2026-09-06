import React, { useState } from "react";
import {
    FileText,
    Trash2,
    Search as SearchIcon,
    File as FileGeneric,
    Play,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Layers,
    Calendar,
    HardDrive,
    User,
    LayoutGrid,
    List
} from "lucide-react";

import type { Document } from "../services/documentService";
import { Card, CardContent } from "../../../components/layout/Card";
import { Button } from "../../../components/ui/Button";

interface DocumentsListProps {
    documents: Document[];
    onDelete: (id: string) => Promise<void>;
    onSelect: (doc: Document) => void;
    onProcess: (id: string) => Promise<void>;
}

export const DocumentsList: React.FC<DocumentsListProps> = ({
    documents,
    onDelete,
    onSelect,
    onProcess,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
    const [confirmDeleteDoc, setConfirmDeleteDoc] = useState<Document | null>(null);

    const filtered = documents.filter((doc) => {
        const matchesSearch =
            (doc.original_filename || doc.filename || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (doc.uploaded_by || "").toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;

        if (statusFilter === "ALL") return true;
        if (statusFilter === "UPLOADED") return doc.status === "Uploaded";
        if (statusFilter === "PROCESSING")
            return [
                "Parsing",
                "Cleaning",
                "Chunking",
                "Embedding",
                "Indexing",
                "Processing",
            ].includes(doc.status);
        if (statusFilter === "COMPLETED")
            return doc.status === "Completed" || doc.status === "Chunked";
        if (statusFilter === "FAILED") return doc.status === "Failed";
        return true;
    });

    const getFileIcon = (fileType: string = "", filename: string = "") => {
        const lower = (fileType + " " + filename).toLowerCase();
        if (lower.includes("pdf")) return <FileText className="text-red-500 h-5 w-5" />;
        if (lower.includes("word") || lower.includes("docx"))
            return <FileText className="text-blue-500 h-5 w-5" />;
        if (lower.includes("md") || lower.includes("markdown"))
            return <FileText className="text-purple-500 h-5 w-5" />;
        return <FileGeneric className="text-amber-500 h-5 w-5" />;
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes || bytes === 0) return "0 KB";
        const k = 1024;
        const dm = 1;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    const renderStatusBadge = (doc: Document) => {
        const status = doc.status || "Uploaded";
        const isProcessing = [
            "Parsing",
            "Cleaning",
            "Chunking",
            "Embedding",
            "Indexing",
            "Processing",
        ].includes(status);

        if (isProcessing) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>{doc.current_stage || status}</span>
                </span>
            );
        }

        if (status === "Completed" || status === "Chunked") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{status === "Chunked" ? "Chunked" : "Indexed"}</span>
                </span>
            );
        }

        if (status === "Failed") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    <AlertCircle className="h-3 w-3" />
                    <span>Failed</span>
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <HardDrive className="h-3 w-3" />
                <span>Uploaded</span>
            </span>
        );
    };

    const handleProcessClick = async (e: React.MouseEvent, docId: string) => {
        e.stopPropagation();
        setProcessingIds((prev) => new Set(prev).add(docId));
        try {
            await onProcess(docId);
        } finally {
            setProcessingIds((prev) => {
                const next = new Set(prev);
                next.delete(docId);
                return next;
            });
        }
    };

    const handleConfirmDelete = async () => {
        if (!confirmDeleteDoc) return;
        setDeletingId(confirmDeleteDoc.id);
        try {
            await onDelete(confirmDeleteDoc.id);
            setConfirmDeleteDoc(null);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Filter, Search & View Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search documents by filename or author..."
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-foreground placeholder:text-muted-foreground"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border overflow-x-auto">
                        {[
                            { key: "ALL", label: "All" },
                            { key: "UPLOADED", label: "Uploaded" },
                            { key: "PROCESSING", label: "Processing" },
                            { key: "COMPLETED", label: "Indexed" },
                            { key: "FAILED", label: "Failed" },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setStatusFilter(tab.key)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all shrink-0 ${
                                    statusFilter === tab.key
                                        ? "bg-background text-foreground shadow-sm font-semibold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center border border-border rounded-lg bg-muted/50 p-0.5">
                        <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded-md transition-colors ${
                                viewMode === "grid"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                            title="Grid View"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("table")}
                            className={`p-1.5 rounded-md transition-colors ${
                                viewMode === "table"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                            title="Table View"
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Listing */}
            {filtered.length === 0 ? (
                <div className="text-center py-12 bg-card/50 rounded-xl border border-dashed border-border">
                    <FileText className="mx-auto h-10 w-10 text-muted-foreground/60 mb-2" />
                    <p className="text-sm font-medium text-foreground">No documents found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Try adjusting your search query or status filter.
                    </p>
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((doc) => {
                        const isProcessing = processingIds.has(doc.id) || [
                            "Parsing",
                            "Cleaning",
                            "Chunking",
                            "Embedding",
                            "Indexing",
                            "Processing",
                        ].includes(doc.status);
                        const canProcess = doc.status === "Uploaded" || doc.status === "Failed";

                        return (
                            <Card
                                key={doc.id}
                                className="group overflow-hidden hover:border-primary/40 hover:shadow-md transition-all cursor-pointer bg-card/80 flex flex-col justify-between"
                                onClick={() => onSelect(doc)}
                            >
                                <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="p-2.5 bg-muted/60 dark:bg-muted/40 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                                                {getFileIcon(doc.file_type, doc.original_filename || doc.filename)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4
                                                    className="font-semibold text-sm text-foreground truncate"
                                                    title={doc.original_filename || doc.filename}
                                                >
                                                    {doc.original_filename || doc.filename}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                    <span>{formatFileSize(doc.file_size)}</span>
                                                    <span>•</span>
                                                    <span className="truncate">{doc.file_type || "Document"}</span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 !p-0 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirmDeleteDoc(doc);
                                                }}
                                                title="Delete document"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="space-y-1.5 pt-1 text-xs text-muted-foreground">
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-1.5">
                                                    <Layers className="h-3.5 w-3.5 text-primary" />
                                                    <span className="font-medium text-foreground">
                                                        {doc.chunk_count || 0} Chunks
                                                    </span>
                                                </span>
                                                <span className="flex items-center gap-1 text-[11px]">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>
                                                        {new Date(doc.uploaded_at).toLocaleDateString(undefined, {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        })}
                                                    </span>
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1 text-[11px] truncate">
                                                <User className="h-3 w-3 shrink-0" />
                                                <span className="truncate" title={doc.uploaded_by}>
                                                    {doc.uploaded_by}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                                        <div>{renderStatusBadge(doc)}</div>

                                        {canProcess && (
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                disabled={isProcessing}
                                                onClick={(e) => handleProcessClick(e, doc.id)}
                                                className="h-7 text-xs px-2.5 flex items-center gap-1.5 shadow-sm"
                                            >
                                                {isProcessing ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <Play className="h-3 w-3 fill-current" />
                                                )}
                                                <span>{isProcessing ? "Processing..." : "Process"}</span>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="border border-border rounded-xl overflow-hidden bg-card/80 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/60 text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Document</th>
                                    <th className="px-4 py-3 font-semibold">Size</th>
                                    <th className="px-4 py-3 font-semibold">Uploaded By</th>
                                    <th className="px-4 py-3 font-semibold">Date</th>
                                    <th className="px-4 py-3 font-semibold">Chunks</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.map((doc) => {
                                    const isProcessing = processingIds.has(doc.id) || [
                                        "Parsing",
                                        "Cleaning",
                                        "Chunking",
                                        "Embedding",
                                        "Indexing",
                                        "Processing",
                                    ].includes(doc.status);
                                    const canProcess = doc.status === "Uploaded" || doc.status === "Failed";

                                    return (
                                        <tr
                                            key={doc.id}
                                            onClick={() => onSelect(doc)}
                                            className="hover:bg-muted/40 cursor-pointer transition-colors"
                                        >
                                            <td className="px-4 py-3 font-medium text-foreground">
                                                <div className="flex items-center gap-2.5">
                                                    {getFileIcon(doc.file_type, doc.original_filename || doc.filename)}
                                                    <div className="min-w-0 max-w-xs">
                                                        <div className="truncate font-semibold text-xs text-foreground" title={doc.original_filename || doc.filename}>
                                                            {doc.original_filename || doc.filename}
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground truncate">
                                                            {doc.file_type}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                                {formatFileSize(doc.file_size)}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap truncate max-w-[140px]" title={doc.uploaded_by}>
                                                {doc.uploaded_by}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                                {new Date(doc.uploaded_at).toLocaleDateString(undefined, {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="px-4 py-3 text-xs font-semibold text-foreground whitespace-nowrap">
                                                {doc.chunk_count || 0}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {renderStatusBadge(doc)}
                                            </td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    {canProcess && (
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            disabled={isProcessing}
                                                            onClick={(e) => handleProcessClick(e, doc.id)}
                                                            className="h-7 text-xs px-2.5 flex items-center gap-1"
                                                        >
                                                            {isProcessing ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <Play className="h-3 w-3 fill-current" />
                                                            )}
                                                            <span>Process</span>
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 w-7 !p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                                                        onClick={() => setConfirmDeleteDoc(doc)}
                                                        title="Delete document"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmDeleteDoc && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center gap-3 text-destructive">
                            <div className="p-2 rounded-full bg-destructive/10">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">Delete Document</h3>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-foreground">
                                {confirmDeleteDoc.original_filename || confirmDeleteDoc.filename}
                            </span>
                            ? This will permanently remove its parsed content, chunks, and vector index entries.
                        </p>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setConfirmDeleteDoc(null)}
                                disabled={deletingId !== null}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleConfirmDelete}
                                disabled={deletingId !== null}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                                {deletingId ? (
                                    <span className="flex items-center gap-1.5">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting...
                                    </span>
                                ) : (
                                    "Confirm Delete"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

