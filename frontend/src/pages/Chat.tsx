import { useEffect, useRef, useState } from "react"
import {
    MessageSquare,
    Sparkles,
    Plus,
    Trash2,
    ChevronRight,
    Bot,
    PanelLeftClose,
    PanelLeftOpen,
    AlertCircle
} from "lucide-react"
import { ChatInput } from "../features/chat/components/ChatInput"
import { ChatMessage } from "../features/chat/components/ChatMessage"
import { TypingIndicator } from "../features/chat/components/TypingIndicator"
import { chatService } from "../features/chat/services/chatService"
import type { AskResponse, ChatSession, ChatMessageItem } from "../features/chat/services/chatService"
import { Button } from "../components/ui/Button"

interface ChatMessageState {
    role: "user" | "assistant" | "error"
    content: string
    citations?: AskResponse["citations"]
    times?: { llm: number; retrieval: number; total: number }
}

export default function Chat() {
    const [sessions, setSessions] = useState<ChatSession[]>([])
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
    const [activeSessionTitle, setActiveSessionTitle] = useState<string>("New Conversation")
    const [messages, setMessages] = useState<ChatMessageState[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingSessions, setIsLoadingSessions] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement | null>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isLoading])

    // Load user's chat sessions on mount
    const loadSessions = async () => {
        setIsLoadingSessions(true)
        try {
            const data = await chatService.getSessions()
            setSessions(data)
        } catch (err: any) {
            console.error("Failed to load sessions:", err)
        } finally {
            setIsLoadingSessions(false)
        }
    }

    useEffect(() => {
        loadSessions()
    }, [])

    // Load active session messages when activeSessionId changes
    const selectSession = async (sessionId: string) => {
        if (sessionId === activeSessionId) return
        setActiveSessionId(sessionId)
        setError(null)
        setIsLoading(true)

        try {
            const detail = await chatService.getSession(sessionId)
            setActiveSessionTitle(detail.title || "Conversation")
            const mapped: ChatMessageState[] = detail.messages.map((m: ChatMessageItem) => ({
                role: m.role,
                content: m.content,
                citations: m.citations,
            }))
            setMessages(mapped)
        } catch (err: any) {
            setError(err.message || "Failed to load conversation history.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleNewChat = () => {
        setActiveSessionId(null)
        setActiveSessionTitle("New Conversation")
        setMessages([])
        setError(null)
    }

    const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation()
        try {
            await chatService.deleteSession(sessionId)
            setSessions((prev) => prev.filter((s) => s.session_id !== sessionId))
            if (activeSessionId === sessionId) {
                handleNewChat()
            }
        } catch (err: any) {
            setError(err.message || "Failed to delete session.")
        }
    }

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
            const response = await chatService.askQuestion(trimmed, 5, activeSessionId || undefined)

            // If a new session was created on backend, update activeSessionId and refresh sessions list
            if (response.session_id && response.session_id !== activeSessionId) {
                setActiveSessionId(response.session_id)
                setActiveSessionTitle(trimmed.length > 40 ? trimmed.substring(0, 37) + "..." : trimmed)
                loadSessions()
            }

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

    const formatTimestamp = (dateStr: string) => {
        try {
            const date = new Date(dateStr)
            return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
        } catch {
            return ""
        }
    }

    const samplePrompts = [
        "What is the company leave and PTO policy?",
        "Explain the IT security and access guidelines.",
        "Summarize employee benefits and allowances.",
    ]

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
            {/* Conversation Sidebar */}
            <aside
                className={`${
                    sidebarOpen ? "w-72" : "w-0 -ml-72"
                } transition-all duration-300 ease-in-out border-r border-border bg-card/60 flex flex-col shrink-0 overflow-hidden`}
            >
                <div className="p-3 border-b border-border flex items-center justify-between">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleNewChat}
                        className="w-full flex items-center justify-center gap-2 text-sm shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Chat</span>
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Conversations ({sessions.length})
                    </div>

                    {isLoadingSessions ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                            Loading history...
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                            No past conversations yet. Start a new chat!
                        </div>
                    ) : (
                        sessions.map((s) => {
                            const isActive = s.session_id === activeSessionId
                            return (
                                <div
                                    key={s.session_id}
                                    onClick={() => selectSession(s.session_id)}
                                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                                        isActive
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "text-foreground hover:bg-muted/50"
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 truncate">
                                        <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                                        <span className="truncate">{s.title || "Untitled Chat"}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] text-muted-foreground group-hover:hidden">
                                            {formatTimestamp(s.updated_at || s.created_at)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(e) => handleDeleteSession(e, s.session_id)}
                                            className="hidden group-hover:flex items-center justify-center p-1 rounded hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/40 text-muted-foreground"
                                            title="Delete conversation"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </aside>

            {/* Main Chat Workspace */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
                {/* Header */}
                <header className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-background/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors"
                            title={sidebarOpen ? "Collapse sidebar" : "Open sidebar"}
                        >
                            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                        </button>
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-primary" />
                            <h2 className="font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                                {activeSessionTitle}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            <Sparkles className="h-3 w-3" />
                            Grounded RAG
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNewChat}
                            className="hidden sm:flex items-center gap-1 text-xs"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            New Chat
                        </Button>
                    </div>
                </header>

                {/* Message Thread */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                    {messages.length === 0 && !isLoading && (
                        <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center px-4">
                            <div className="max-w-md space-y-4">
                                <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground">
                                    Enterprise Knowledge Assistant
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Ask questions about your uploaded company documents. EKA provides grounded answers with source citations and supports follow-up questions.
                                </p>

                                <div className="pt-4 space-y-2 text-left">
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                                        Suggested Questions
                                    </div>
                                    {samplePrompts.map((prompt, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSend(prompt)}
                                            className="w-full text-left text-sm p-3 rounded-lg border border-border bg-card/50 hover:bg-primary/5 hover:border-primary/30 transition-all flex items-center justify-between group"
                                        >
                                            <span className="text-foreground">{prompt}</span>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <ChatMessage key={`${msg.role}-${idx}`} message={msg} />
                    ))}

                    {isLoading && <TypingIndicator />}

                    {error && (
                        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <ChatInput
                    onSend={handleSend}
                    isLoading={isLoading}
                    placeholder={
                        messages.length > 0
                            ? "Ask a follow-up question..."
                            : "Ask a question against your documents..."
                    }
                />
            </main>
        </div>
    )
}

