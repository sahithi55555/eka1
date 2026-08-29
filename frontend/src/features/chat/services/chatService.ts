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
    session_id?: string;
}

export interface ChatSession {
    session_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface ChatMessageItem {
    id: string;
    role: "user" | "assistant";
    content: string;
    citations?: Citation[];
    created_at: string;
}

export interface ChatSessionDetail {
    session_id: string;
    title: string;
    created_at: string;
    updated_at: string;
    messages: ChatMessageItem[];
}

export const chatService = {
    async askQuestion(question: string, top_k: number = 5, session_id?: string): Promise<AskResponse> {
        const bodyPayload: any = { question, top_k };
        if (session_id) {
            bodyPayload.session_id = session_id;
        }

        const response = await fetch(`${API_URL}/ask`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(bodyPayload)
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
    },

    async getSessions(): Promise<ChatSession[]> {
        const response = await fetch(`${API_URL}/sessions`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            let errorMsg = "Failed to fetch chat sessions";
            try {
                const data = await response.json();
                errorMsg = data.detail || errorMsg;
            } catch (e) {
                // ignore
            }
            throw new Error(errorMsg);
        }

        return response.json();
    },

    async createSession(title: string = "New Chat"): Promise<ChatSession> {
        const response = await fetch(`${API_URL}/sessions`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ title })
        });

        if (!response.ok) {
            let errorMsg = "Failed to create chat session";
            try {
                const data = await response.json();
                errorMsg = data.detail || errorMsg;
            } catch (e) {
                // ignore
            }
            throw new Error(errorMsg);
        }

        return response.json();
    },

    async getSession(sessionId: string): Promise<ChatSessionDetail> {
        const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            let errorMsg = "Failed to fetch session details";
            try {
                const data = await response.json();
                errorMsg = data.detail || errorMsg;
            } catch (e) {
                // ignore
            }
            throw new Error(errorMsg);
        }

        return response.json();
    },

    async deleteSession(sessionId: string): Promise<void> {
        const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
            method: "DELETE",
            headers: getHeaders()
        });

        if (!response.ok) {
            let errorMsg = "Failed to delete chat session";
            try {
                const data = await response.json();
                errorMsg = data.detail || errorMsg;
            } catch (e) {
                // ignore
            }
            throw new Error(errorMsg);
        }
    }
};

