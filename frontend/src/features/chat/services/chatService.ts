const API_URL = "http://localhost:8000/api/v1/chat";

const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };
};

export interface Citation {
    source_id?: string;
    document_name: string;
    page_start: number;
    page_end: number;
    chunk_index: number;
    text_preview?: string;
}

export interface AskResponse {
    answer: string;
    citations: Citation[];
    retrieved_chunks: any[];
    retrieval_time_ms: number;
    llm_response_time_ms: number;
    total_response_time_ms: number;
}

export const chatService = {
    async askQuestion(question: string, top_k: number = 5): Promise<AskResponse> {
        const response = await fetch(`${API_URL}/ask`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ question, top_k })
        });

        if (!response.ok) {
            let errorMsg = "Chat API Error";
            try {
                const data = await response.json();
                errorMsg = data.detail || errorMsg;
            } catch (e) {
                // ignore
            }
            throw new Error(errorMsg);
        }

        return response.json();
    }
};
