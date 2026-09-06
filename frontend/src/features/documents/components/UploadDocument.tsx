import React, { useState, useRef } from "react";
import { UploadCloud, File as FileIcon, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "../../../components/layout/Card";
import { Button } from "../../../components/ui/Button";

interface UploadDocumentProps {
    onUpload: (file: File) => Promise<void>;
}

export const UploadDocument: React.FC<UploadDocumentProps> = ({ onUpload }) => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
        setError(null);
        setSuccessMessage(null);
        const allowedTypes = [".pdf", ".docx", ".txt", ".md"];
        const ext = `.${selectedFile.name.split(".").pop()?.toLowerCase()}`;
        if (allowedTypes.includes(ext)) {
            // Check file size (15MB limit)
            if (selectedFile.size > 15 * 1024 * 1024) {
                setError("File exceeds the maximum limit of 15MB.");
                return;
            }
            setFile(selectedFile);
        } else {
            setError(`File type not supported. Allowed formats: ${allowedTypes.join(", ")}`);
        }
    };

    const handleUploadClick = async () => {
        if (!file) return;
        setUploading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await onUpload(file);
            setSuccessMessage(`Successfully uploaded "${file.name}". You can now process it.`);
            setFile(null);
        } catch (err: any) {
            setError(err.message || "Failed to upload document. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card className="mb-8 border-border bg-card/60">
            <CardContent className="p-6">
                <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                        dragActive
                            ? "border-primary bg-primary/5 scale-[1.005]"
                            : "border-border hover:border-primary/40 bg-background/50"
                    }`}
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
                            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <UploadCloud className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    Drag & drop your document here, or{" "}
                                    <button
                                        type="button"
                                        className="text-primary hover:underline font-semibold"
                                        onClick={() => inputRef.current?.click()}
                                    >
                                        browse files
                                    </button>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1.5">
                                    Supported formats: PDF, DOCX, TXT, MD (Max 15MB)
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center p-3.5 bg-muted/60 dark:bg-muted/30 border border-border rounded-xl w-full max-w-md relative">
                                <div className="p-2 bg-primary/10 text-primary rounded-lg mr-3 shrink-0">
                                    <FileIcon className="h-6 w-6" />
                                </div>
                                <div className="text-left flex-1 min-w-0 pr-6">
                                    <p className="text-sm font-medium truncate text-foreground">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="p-1 hover:bg-muted rounded-md absolute right-2.5 top-3 text-muted-foreground hover:text-foreground"
                                    onClick={() => setFile(null)}
                                    title="Remove file"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFile(null)}
                                    disabled={uploading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleUploadClick}
                                    disabled={uploading}
                                    variant="primary"
                                    size="sm"
                                    className="shadow-sm"
                                >
                                    {uploading ? (
                                        <span className="flex items-center gap-1.5">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
                                        </span>
                                    ) : (
                                        "Upload Document"
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

