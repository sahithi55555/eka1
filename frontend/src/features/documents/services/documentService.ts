export interface Document {
    id: string;
    filename: string;
    original_filename: string;
    file_type: string;
    file_size: number;
    status: string;
    uploaded_at: string;
    uploaded_by: string;
    chunk_count?: number;
    current_stage?: string;
    word_count?: number;
    character_count?: number;
    embedding_model?: string;
    embedding_dimension?: number;
    embedding_count?: number;
    processed_at?: string;
    indexed_at?: string;
}

export interface DocumentChunk {
    id: string;
    document_id: string;
    chunk_index: number;
    text: string;
    word_count: number;
    character_count: number;
    metadata: {
        document_name: string;
        file_type: string;
        page_start: number;
        page_end: number;
    };
}

export interface DocumentStatus {
    status: string;
    progress: number;
    current_stage?: string;
}

export interface EmbeddingStatus {
    status: string;
    progress: number;
    current_stage?: string;
    embedding_model?: string;
    embedding_dimension?: number;
    embedding_count?: number;
    indexed_at?: string;
}

const API_URL = "http://localhost:8000/api/v1/documents";

const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        Authorization: `Bearer ${token}`
    };
};

async function handleErrorResponse(response: Response, defaultMessage: string): Promise<never> {
    let errorDetail = defaultMessage;
    try {
        const errorJson = await response.json();
        if (errorJson && errorJson.detail) {
            errorDetail = typeof errorJson.detail === "string" 
                ? errorJson.detail 
                : JSON.stringify(errorJson.detail);
        }
    } catch {
        if (response.status === 401) {
            errorDetail = "Unauthorized. Please log in again.";
        } else if (response.status === 403) {
            errorDetail = "Access denied. You do not have permission to perform this action.";
        } else if (response.status === 404) {
            errorDetail = "Document not found or has been deleted.";
        } else if (response.status >= 500) {
            errorDetail = "Server error occurred. Please try again later.";
        }
    }
    throw new Error(errorDetail);
}

export const documentService = {
    async fetchDocuments(): Promise<Document[]> {
        const response = await fetch(`${API_URL}/`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            await handleErrorResponse(response, "Failed to fetch documents");
        }
        return response.json();
    },

    async fetchDocument(id: string): Promise<Document> {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            await handleErrorResponse(response, "Failed to fetch document details");
        }
        return response.json();
    },

    async uploadDocument(file: File): Promise<Document> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_URL}/upload`, {
            method: "POST",
            headers: getHeaders(), 
            body: formData,
        });

        if (!response.ok) {
            await handleErrorResponse(response, "Failed to upload document");
        }
        return response.json();
    },

    async deleteDocument(id: string): Promise<boolean> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: getHeaders()
        });
        if (!response.ok) {
            await handleErrorResponse(response, "Failed to delete document");
        }
        return true;
    },

    async processDocument(id: string): Promise<boolean> {
        const response = await fetch(`${API_URL}/${id}/process`, {
            method: "POST",
            headers: getHeaders()
        });
        if (!response.ok) {
            await handleErrorResponse(response, "Failed to trigger document processing");
        }
        return true;
    },

    async fetchDocumentStatus(id: string): Promise<DocumentStatus> {
        const response = await fetch(`${API_URL}/${id}/status`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            await handleErrorResponse(response, "Failed to fetch document status");
        }
        return response.json();
    },

    async fetchEmbeddingStatus(id: string): Promise<EmbeddingStatus> {
        const response = await fetch(`${API_URL}/${id}/embedding-status`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            await handleErrorResponse(response, "Failed to fetch embedding status");
        }
        return response.json();
    },

    async fetchDocumentChunks(id: string): Promise<DocumentChunk[]> {
        const response = await fetch(`${API_URL}/${id}/chunks`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            await handleErrorResponse(response, "Failed to fetch document chunks");
        }
        return response.json();
    }
};

