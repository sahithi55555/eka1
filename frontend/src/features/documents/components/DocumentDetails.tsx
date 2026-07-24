import React, { useState, useEffect } from "react";
import { ArrowLeft, Play, AlertCircle, CheckCircle } from "lucide-react";
import type { Document, DocumentChunk } from "../services/documentService";
import { documentService } from "../services/documentService";
import { Button } from "../../../components/ui/Button";
import { DocumentChunksList } from "./DocumentChunksList";

interface DocumentDetailsProps {
    document: Document;
    onBack: () => void;
    onProcessUpdate: () => void;
}

export const DocumentDetails: React.FC<DocumentDetailsProps> = ({ document, onBack, onProcessUpdate }) => {
    const [status, setStatus] = useState(document.status);
    const [progress, setProgress] = useState(0);
    const [currentStage, setCurrentStage] = useState<string | undefined>(document.current_stage);
    const [embeddingMetadata, setEmbeddingMetadata] = useState<any>(null);
    const [chunks, setChunks] = useState<DocumentChunk[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        const checkStatus = async () => {
            try {
                // Fetch the detailed embedding status
                const stat = await documentService.fetchEmbeddingStatus(document.id);
                setStatus(stat.status);
                setProgress(stat.progress);
                setCurrentStage(stat.current_stage);
                setEmbeddingMetadata({
                    embedding_model: stat.embedding_model,
                    embedding_dimension: stat.embedding_dimension,
                    embedding_count: stat.embedding_count,
                    indexed_at: stat.indexed_at
                });
                
                if (stat.status === "Completed" || stat.status === "Failed") {
                    clearInterval(interval);
                    onProcessUpdate();
                    if (stat.status === "Completed") {
                        const loadedChunks = await documentService.fetchDocumentChunks(document.id);
                        setChunks(loadedChunks);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        };

        if (status !== "Completed" && status !== "Failed" && status !== "Uploaded") {
            interval = setInterval(checkStatus, 3000);
        } else if (status === "Completed" && chunks.length === 0) {
            checkStatus(); // fetch initial chunks and final metadata
        } else if (status === "Uploaded") {
            setProgress(0);
        }

        return () => clearInterval(interval);
    }, [status, document.id]);

    const handleProcess = async () => {
        try {
            setIsLoading(true);
            await documentService.processDocument(document.id);
            setStatus("Parsing");
            setProgress(15);
            onProcessUpdate();
        } catch (error) {
            alert("Failed to start processing.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <button 
                onClick={onBack} 
                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Documents
            </button>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold dark:text-white mb-2">{document.filename}</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                        <span>{(document.file_size / 1024 / 1024).toFixed(3)} MB</span>
                        <span>{new Date(document.uploaded_at).toLocaleString()}</span>
                        {chunks.length > 0 && <span>{chunks.length} chunks</span>}
                        {document.word_count && <span>{document.word_count} words</span>}
                        {document.character_count && <span>{document.character_count} chars</span>}
                    </div>
                    {embeddingMetadata?.embedding_model && (
                        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium flex gap-3">
                            <span>Model: {embeddingMetadata.embedding_model}</span>
                            <span>Dim: {embeddingMetadata.embedding_dimension}</span>
                            <span>Vectors: {embeddingMetadata.embedding_count}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end shrink-0 w-full md:w-auto">
                    {status === "Uploaded" ? (
                        <Button onClick={handleProcess} disabled={isLoading} className="gap-2 shrink-0">
                            <Play className="h-4 w-4" /> Process Document
                        </Button>
                    ) : status === "Completed" ? (
                        <div className="flex items-center text-green-600 font-medium">
                            <CheckCircle className="h-5 w-5 mr-2" /> Completely Processed & Indexed
                        </div>
                    ) : status === "Failed" ? (
                        <div className="flex items-center text-red-600 font-medium">
                            <AlertCircle className="h-5 w-5 mr-2" /> Processing Failed
                        </div>
                    ) : (
                        <div className="w-full md:w-64">
                            <div className="flex justify-between text-xs mb-1 dark:text-gray-300">
                                <span className="font-medium text-primary uppercase">{currentStage || status}</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                <div className="bg-primary h-2 rounded-full transition-all duration-500 ease-in-out" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {chunks.length > 0 && <DocumentChunksList chunks={chunks} />}
        </div>
    );
};
