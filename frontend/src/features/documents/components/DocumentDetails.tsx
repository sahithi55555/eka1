import React, { useState, useEffect } from "react";
import {
    ArrowLeft,
    Play,
    AlertCircle,
    CheckCircle2,
    Loader2,
    FileText,
    Layers,
    Calendar,
    HardDrive,
    Cpu,
    Hash
} from "lucide-react";

import type { Document, DocumentChunk, EmbeddingStatus } from "../services/documentService";
import { documentService } from "../services/documentService";
import { Button } from "../../../components/ui/Button";
import { Card, CardContent } from "../../../components/layout/Card";
import { DocumentChunksList } from "./DocumentChunksList";

interface DocumentDetailsProps {
    document: Document;
    onBack: () => void;
    onProcessUpdate: () => void;
}

export const DocumentDetails: React.FC<DocumentDetailsProps> = ({
    document: initialDoc,
    onBack,
    onProcessUpdate,
}) => {
    const [doc, setDoc] = useState<Document>(initialDoc);
    const [status, setStatus] = useState<string>(initialDoc.status || "Uploaded");
    const [progress, setProgress] = useState<number>(0);
    const [currentStage, setCurrentStage] = useState<string | undefined>(initialDoc.current_stage);
    const [embeddingMetadata, setEmbeddingMetadata] = useState<EmbeddingStatus | null>(null);
    const [chunks, setChunks] = useState<DocumentChunk[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const formatFileSize = (bytes: number) => {
        if (!bytes || bytes === 0) return "0 KB";
        const k = 1024;
        const dm = 2;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    const fetchFullDetails = React.useCallback(async () => {
        try {
            const updated = await documentService.fetchDocument(doc.id);
            setDoc(updated);
            setStatus(updated.status);
            setCurrentStage(updated.current_stage);

            const stat = await documentService.fetchEmbeddingStatus(doc.id);
            setProgress(stat.progress);
            setEmbeddingMetadata(stat);

            if (updated.status === "Completed" || updated.status === "Chunked") {
                const loadedChunks = await documentService.fetchDocumentChunks(doc.id);
                setChunks(loadedChunks);
            }
        } catch (err: any) {
            console.error("Error refreshing document details:", err);
        }
    }, [doc.id]);

    useEffect(() => {
        fetchFullDetails();
    }, [fetchFullDetails]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        const isProcessing = [
            "Parsing",
            "Cleaning",
            "Chunking",
            "Embedding",
            "Indexing",
            "Processing",
        ].includes(status);

        if (isProcessing) {
            interval = setInterval(async () => {
                try {
                    const stat = await documentService.fetchEmbeddingStatus(doc.id);
                    setStatus(stat.status);
                    setProgress(stat.progress);
                    setCurrentStage(stat.current_stage);
                    setEmbeddingMetadata(stat);

                    if (stat.status === "Completed" || stat.status === "Failed" || stat.status === "Chunked") {
                        clearInterval(interval);
                        fetchFullDetails();
                        onProcessUpdate();
                    }
                } catch (err) {
                    console.error("Polling status error:", err);
                }
            }, 2000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status, doc.id, fetchFullDetails, onProcessUpdate]);

    const handleProcess = async () => {
        try {
            setIsLoading(true);
            setError(null);
            await documentService.processDocument(doc.id);
            setStatus("Parsing");
            setProgress(15);
            setCurrentStage("Parsing Document");
            onProcessUpdate();
        } catch (err: any) {
            setError(err.message || "Failed to start document processing.");
        } finally {
            setIsLoading(false);
        }
    };

    const isProcessing = [
        "Parsing",
        "Cleaning",
        "Chunking",
        "Embedding",
        "Indexing",
        "Processing",
    ].includes(status);

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Knowledge Library</span>
                </button>

                {(status === "Uploaded" || status === "Failed") && (
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={handleProcess}
                        disabled={isLoading || isProcessing}
                        className="flex items-center gap-1.5 shadow-sm"
                    >
                        {isLoading || isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Play className="h-4 w-4 fill-current" />
                        )}
                        <span>{isProcessing ? "Processing..." : "Process Document"}</span>
                    </Button>
                )}
            </div>

            {/* Document Header Card */}
            <Card className="border-border bg-card/80">
                <CardContent className="p-6 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                            <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                                <FileText className="h-7 w-7" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">
                                    {doc.original_filename || doc.filename}
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Document ID: <code className="font-mono">{doc.id}</code>
                                </p>
                            </div>
                        </div>

                        {/* Status Overview */}
                        <div className="shrink-0 flex items-center gap-2">
                            {status === "Completed" || status === "Chunked" ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Indexed & Ready</span>
                                </span>
                            ) : status === "Failed" ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/30">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Processing Failed</span>
                                </span>
                            ) : isProcessing ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>{currentStage || status}</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                    <HardDrive className="h-4 w-4" />
                                    <span>Uploaded (Unprocessed)</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar when processing */}
                    {isProcessing && (
                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span>Stage: {currentStage || status}</span>
                                </span>
                                <span className="font-mono text-blue-700 dark:text-blue-300 font-semibold">
                                    {progress}%
                                </span>
                            </div>
                            <div className="w-full bg-blue-200/50 dark:bg-blue-950/50 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2 border-t border-border">
                        <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <HardDrive className="h-3 w-3" /> File Size
                            </span>
                            <p className="text-sm font-semibold text-foreground">
                                {formatFileSize(doc.file_size)}
                            </p>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <FileText className="h-3 w-3" /> File Type
                            </span>
                            <p className="text-sm font-semibold text-foreground truncate" title={doc.file_type}>
                                {doc.file_type || "Document"}
                            </p>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Layers className="h-3 w-3" /> Chunks
                            </span>
                            <p className="text-sm font-semibold text-foreground">
                                {doc.chunk_count ?? chunks.length ?? 0}
                            </p>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Hash className="h-3 w-3" /> Word Count
                            </span>
                            <p className="text-sm font-semibold text-foreground">
                                {doc.word_count ? doc.word_count.toLocaleString() : "—"}
                            </p>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Hash className="h-3 w-3" /> Characters
                            </span>
                            <p className="text-sm font-semibold text-foreground">
                                {doc.character_count ? doc.character_count.toLocaleString() : "—"}
                            </p>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Cpu className="h-3 w-3" /> Embedding Model
                            </span>
                            <p className="text-xs font-semibold text-foreground truncate" title={embeddingMetadata?.embedding_model || doc.embedding_model || "all-MiniLM-L6-v2"}>
                                {embeddingMetadata?.embedding_model || doc.embedding_model || (status === "Completed" ? "all-MiniLM-L6-v2" : "—")}
                            </p>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Upload Date
                            </span>
                            <p className="text-xs font-semibold text-foreground">
                                {new Date(doc.uploaded_at).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </p>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <FileText className="h-3 w-3" /> Uploaded By
                            </span>
                            <p className="text-xs font-semibold text-foreground truncate" title={doc.uploaded_by}>
                                {doc.uploaded_by || "—"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Extracted Chunks Inspection List */}
            {chunks.length > 0 ? (
                <DocumentChunksList chunks={chunks} />
            ) : status === "Uploaded" ? (
                <div className="p-8 text-center bg-card/40 rounded-xl border border-dashed border-border space-y-2">
                    <Layers className="h-8 w-8 mx-auto text-muted-foreground/60" />
                    <h3 className="text-sm font-semibold text-foreground">No Chunks Generated Yet</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        This document has been uploaded but not yet parsed into semantic chunks. Click "Process Document" above to extract chunks and vectorize.
                    </p>
                </div>
            ) : null}
        </div>
    );
};

