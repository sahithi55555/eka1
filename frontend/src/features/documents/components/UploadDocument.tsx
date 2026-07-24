import React, { useState, useRef } from "react";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { Card, CardContent } from "../../../components/layout/Card";
import { Button } from "../../../components/ui/Button";

interface UploadDocumentProps {
    onUpload: (file: File) => Promise<void>;
}

export const UploadDocument: React.FC<UploadDocumentProps> = ({ onUpload }) => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleFileSelect = (selectedFile: File) => {
        const allowedTypes = [".pdf", ".docx", ".txt", ".md"];
        const ext = `.${selectedFile.name.split('.').pop()?.toLowerCase()}`;
        if (allowedTypes.includes(ext)) {
            setFile(selectedFile);
        } else {
            alert(`File type not supported. Allowed: ${allowedTypes.join(", ")}`);
        }
    };

    const handleUploadClick = async () => {
        if (!file) return;
        setUploading(true);
        try {
            await onUpload(file);
            setFile(null); // Clear after upload
        } catch (error) {
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card className="mb-8">
            <CardContent className="pt-6">
                <div
                    className={`relative border-2 border-dashed rounded-lg p-10 text-center transition-colors
                        ${dragActive ? "border-primary bg-primary/5" : "border-gray-300 dark:border-gray-700"}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.txt,.md"
                        onChange={handleChange}
                    />

                    {!file ? (
                        <div className="space-y-4">
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Drag & drop a file here, or{" "}
                                    <button
                                        type="button"
                                        className="text-primary hover:underline"
                                        onClick={() => inputRef.current?.click()}
                                    >
                                        browse
                                    </button>
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Supports PDF, DOCX, TXT, MD (Max 10MB)
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md w-full max-w-sm relative">
                                <FileIcon className="h-8 w-8 mr-3 text-blue-500" />
                                <div className="text-left flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate dark:text-gray-200">{file.name}</p>
                                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <button
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded absolute right-2 top-2"
                                    onClick={() => setFile(null)}
                                >
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            </div>
                            <Button
                                onClick={handleUploadClick}
                                disabled={uploading}
                                variant="primary"
                            >
                                {uploading ? "Uploading..." : "Upload Document"}
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
