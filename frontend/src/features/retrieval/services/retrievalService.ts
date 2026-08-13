const API_URL = "http://localhost:8000/api/v1/retrieval";

const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };
};

export interface RetrievalFilters {
    document_id?: string;
    department?: string;
    uploader?: string;
    tags?: string[];
    file_type?: string;
    upload_date?: string;
}

export interface SearchRequest {
    query: string;
    top_k?: number;
    filters?: RetrievalFilters;
}

export interface SearchResultItemMetadata {
    document_name: string;
    filename: string;
    file_type: string;
    uploaded_by: string;
    upload_date: string;
    word_count: number;
    character_count: number;
}

export interface SearchResultItem {
    document_id: string;
    chunk_id: string;
    chunk_index: number;
    chunk_text: string;
    page_start: int;
    page_end: int;
    similarity_score: number;
    metadata: SearchResultItemMetadata;
}

export interface SearchResponseData {
    query: string;
    retrieval_time_ms: number;
    total_results: number;
    results: SearchResultItem[];
}

export interface SearchMetadata {
    total_chunks_searched: number;
    total_chunks_returned: number;
    embedding_time_ms: number;
    vector_search_time_ms: number;
    retrieval_time_ms: number;
}

export interface APIResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    metadata?: SearchMetadata;
    error_code?: string;
    details?: string;
}

export const retrievalService = {
    async search(request: SearchRequest): Promise<APIResponse<SearchResponseData>> {
        const response = await fetch(`${API_URL}/search`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(request)
        });
        return response.json();
    }
};
