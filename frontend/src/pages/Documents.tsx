import { useState, useEffect } from "react";
import { PageHeader } from "../components/common/PageHeader";
import { EmptyState } from "../components/ui/EmptyState";
import { FileText, Plus } from "lucide-react";
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

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const data = await documentService.fetchDocuments();
            setDocuments(data);
        } catch (error) {
            console.error("Failed to fetch documents", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDocuments();
    }, []);

    const handleUpload = async (file: File) => {
        await documentService.uploadDocument(file);
        await loadDocuments(); // refresh list
        setShowUpload(false);
    };

    const handleDelete = async (id: string) => {
        try {
            await documentService.deleteDocument(id);
            setDocuments(prev => prev.filter(doc => doc.id !== id));
            if (selectedDocument?.id === id) {
                setSelectedDocument(null);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to delete the document.");
        }
    };

    if (selectedDocument) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <DocumentDetails 
                    document={selectedDocument}
                    onBack={() => {
                        setSelectedDocument(null);
                        loadDocuments(); // Refresh in case it processed
                    }}
                    onProcessUpdate={loadDocuments}
                />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Documents"
                description="Manage your parsed and vectorized knowledge sources."
                actions={
                    <Button className="gap-2" onClick={() => setShowUpload(!showUpload)}>
                        <Plus className="h-4 w-4" /> {showUpload ? "Cancel Upload" : "Upload Document"}
                    </Button>
                }
            />

            {showUpload && (
                <UploadDocument onUpload={handleUpload} />
            )}

            {!loading && documents.length === 0 && !showUpload ? (
                <div className="mt-8">
                    <EmptyState
                        icon={<FileText className="h-8 w-8" />}
                        title="No documents uploaded"
                        description="Upload PDFs, text files, or markdown to start building your knowledge base."
                    />
                </div>
            ) : (!loading && (
                <DocumentsList 
                    documents={documents} 
                    onDelete={handleDelete} 
                    onSelect={setSelectedDocument}
                />
            ))}

            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}
        </div>
    );
}
