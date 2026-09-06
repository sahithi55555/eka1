import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "../components/common/PageHeader";
import { EmptyState } from "../components/ui/EmptyState";
import { FileText, Plus, HardDrive, CheckCircle2, Layers, Hash } from "lucide-react";
import { Button } from "../components/ui/Button";
import type { Document } from "../features/documents/services/documentService";
import { documentService } from "../features/documents/services/documentService";
import { UploadDocument } from "../features/documents/components/UploadDocument";
import { DocumentsList } from "../features/documents/components/DocumentsList";
import { DocumentDetails } from "../features/documents/components/DocumentDetails";

export default function Documents() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

    const loadDocuments = useCallback(async (showLoadingSpinner: boolean = true) => {
        try {
            if (showLoadingSpinner) setLoading(true);
            const data = await documentService.fetchDocuments();
            setDocuments(data);

            // If a document is currently selected, keep its reference updated
            if (selectedDocument) {
                const refreshed = data.find((d) => d.id === selectedDocument.id);
                if (refreshed) {
                    setSelectedDocument(refreshed);
                }
            }
        } catch (error) {
            console.error("Failed to fetch documents", error);
        } finally {
            if (showLoadingSpinner) setLoading(false);
        }
    }, [selectedDocument]);

    useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);

    // Polling interval if any document is currently in a processing state
    useEffect(() => {
        const hasProcessingDocs = documents.some((doc) =>
            [
                "Parsing",
                "Cleaning",
                "Chunking",
                "Embedding",
                "Indexing",
                "Processing",
            ].includes(doc.status)
        );

        if (!hasProcessingDocs) return;

        const interval = setInterval(() => {
            loadDocuments(false);
        }, 2500);

        return () => clearInterval(interval);
    }, [documents, loadDocuments]);

    const handleUpload = async (file: File) => {
        await documentService.uploadDocument(file);
        await loadDocuments(false); // refresh list
    };

    const handleProcess = async (id: string) => {
        try {
            await documentService.processDocument(id);
            setDocuments((prev) =>
                prev.map((doc) =>
                    doc.id === id
                        ? { ...doc, status: "Parsing", current_stage: "Parsing Document" }
                        : doc
                )
            );
        } catch (err: any) {
            alert(err.message || "Failed to trigger processing.");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await documentService.deleteDocument(id);
            setDocuments((prev) => prev.filter((doc) => doc.id !== id));
            if (selectedDocument?.id === id) {
                setSelectedDocument(null);
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to delete the document.");
        }
    };

    // Calculate Summary Stats
    const totalDocs = documents.length;
    const completedDocs = documents.filter(
        (d) => d.status === "Completed" || d.status === "Chunked"
    ).length;
    const totalChunks = documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0);
    const totalWords = documents.reduce((acc, d) => acc + (d.word_count || 0), 0);

    if (selectedDocument) {
        return (
            <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
                <DocumentDetails
                    document={selectedDocument}
                    onBack={() => {
                        setSelectedDocument(null);
                        loadDocuments(false);
                    }}
                    onProcessUpdate={() => loadDocuments(false)}
                />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Knowledge Library"
                description="Upload, process, and inspect enterprise documents indexed in your knowledge base."
                actions={
                    <Button
                        variant="primary"
                        size="sm"
                        className="gap-2 shadow-sm"
                        onClick={() => setShowUpload(!showUpload)}
                    >
                        <Plus className="h-4 w-4" />
                        <span>{showUpload ? "Hide Upload" : "Upload Document"}</span>
                    </Button>
                }
            />

            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <HardDrive className="h-3.5 w-3.5 text-primary" /> Total Documents
                    </span>
                    <p className="text-2xl font-bold text-foreground">{totalDocs}</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Indexed & Ready
                    </span>
                    <p className="text-2xl font-bold text-foreground">{completedDocs}</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Layers className="h-3.5 w-3.5 text-blue-500" /> Extracted Chunks
                    </span>
                    <p className="text-2xl font-bold text-foreground">{totalChunks}</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Hash className="h-3.5 w-3.5 text-purple-500" /> Total Words
                    </span>
                    <p className="text-2xl font-bold text-foreground">{totalWords.toLocaleString()}</p>
                </div>
            </div>

            {showUpload && <UploadDocument onUpload={handleUpload} />}

            {!loading && documents.length === 0 && !showUpload ? (
                <div className="mt-8">
                    <EmptyState
                        icon={<FileText className="h-10 w-10 text-muted-foreground/60" />}
                        title="No documents uploaded yet"
                        description="Upload your company policies, guides, or manuals (PDF, DOCX, TXT, MD) to build your grounded knowledge assistant."
                    />
                </div>
            ) : !loading ? (
                <DocumentsList
                    documents={documents}
                    onDelete={handleDelete}
                    onSelect={setSelectedDocument}
                    onProcess={handleProcess}
                />
            ) : (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}
        </div>
    );
}

