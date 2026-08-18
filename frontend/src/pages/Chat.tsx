import { useState } from "react"
import { MessageSquare, Sparkles } from "lucide-react"
import { ChatInput } from "../features/chat/components/ChatInput"
import { ChatMessage } from "../features/chat/components/ChatMessage"
import { TypingIndicator } from "../features/chat/components/TypingIndicator"
import { chatService } from "../features/chat/services/chatService"
import type { AskResponse } from "../features/chat/services/chatService"

interface ChatMessageState {
    role: "user" | "assistant" | "error"
    content: string
    citations?: AskResponse["citations"]
    times?: { llm: number; retrieval: number; total: number }
}

export default function Chat() {
    const [messages, setMessages] = useState<ChatMessageState[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSend = async (question: string) => {
        const trimmed = question.trim()
        if (!trimmed) return

        setMessages((current) => [
            ...current,
            { role: "user", content: trimmed },
        ])
        setError(null)
        setIsLoading(true)

        try {
            const response = await chatService.askQuestion(trimmed)
            const assistantMessage: ChatMessageState = {
                role: "assistant",
                content: response.answer,
                citations: response.citations,
                times: {
                    retrieval: response.retrieval_time_ms,
                    llm: response.llm_response_time_ms,
                    total: response.total_response_time_ms,
                },
            }
            setMessages((current) => [...current, assistantMessage])
        } catch (err: any) {
            setMessages((current) => [
                ...current,
                { role: "error", content: err.message || "Something went wrong while generating the answer." },
            ])
            setError(err.message || "Something went wrong while generating the answer.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex h-full flex-col overflow-hidden p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold">Knowledge Chat</h1>
                        <p className="text-sm text-muted-foreground">
                            Ask questions grounded in your uploaded documents.
                        </p>
                    </div>
                </div>
                <div className="hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground md:flex">
                    <Sparkles className="h-3.5 w-3.5" />
                    Retrieval + LLM
                </div>
            </div>

            <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-background/50 p-4">
                {messages.length === 0 && !isLoading && (
                    <div className="flex h-full min-h-[300px] items-center justify-center text-center">
                        <div className="space-y-3">
                            <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
                            <p className="text-lg font-medium">Ask a question about your documents</p>
                            <p className="text-sm text-muted-foreground">
                                The assistant will search the knowledge base and answer using only the retrieved context.
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <ChatMessage key={`${msg.role}-${idx}`} message={msg} />
                ))}

                {isLoading && <TypingIndicator />}

                {error && !isLoading && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
                        {error}
                    </div>
                )}
            </div>

            <div className="mt-4">
                <ChatInput onSend={handleSend} isLoading={isLoading} />
            </div>
        </div>
    )
}
