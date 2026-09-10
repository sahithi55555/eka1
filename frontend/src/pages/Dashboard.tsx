import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    Sparkles,
    ArrowRight,
    FileText,
    Search,
    MessageSquare,
    UploadCloud,
    HardDrive,
    CheckCircle2,
    Layers,
    Hash,
    Clock,
    Plus,
    Calendar,
    ChevronRight,
    FileCode
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/layout/Card"
import { authService } from "../features/auth/services/authService"
import { documentService, type Document } from "../features/documents/services/documentService"
import { chatService, type ChatSession } from "../features/chat/services/chatService"

export default function Dashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState<any>(null)
    const [documents, setDocuments] = useState<Document[]>([])
    const [sessions, setSessions] = useState<ChatSession[]>([])
    const [loading, setLoading] = useState(true)
    const [askQuery, setAskQuery] = useState("")

    useEffect(() => {
        let isMounted = true
        async function loadData() {
            try {
                const [currentUser, docs, chats] = await Promise.allSettled([
                    authService.getCurrentUser(),
                    documentService.fetchDocuments(),
                    chatService.getSessions(),
                ])

                if (isMounted) {
                    if (currentUser.status === "fulfilled") setUser(currentUser.value)
                    if (docs.status === "fulfilled") setDocuments(docs.value)
                    if (chats.status === "fulfilled") setSessions(chats.value)
                }
            } catch (err) {
                console.error("Error loading dashboard data", err)
            } finally {
                if (isMounted) setLoading(false)
            }
        }
        loadData()
        return () => { isMounted = false }
    }, [])

    const handleAskSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!askQuery.trim()) return
        navigate(`/chat?q=${encodeURIComponent(askQuery.trim())}`)
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return "Good morning"
        if (hour < 18) return "Good afternoon"
        return "Good evening"
    }

    const firstName = user?.full_name ? user.full_name.split(" ")[0] : "there"

    // Statistics from existing backend data
    const totalDocs = documents.length
    const indexedDocs = documents.filter(d => d.status === "Completed" || d.status === "Chunked").length
    const totalChunks = documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0)
    const totalWords = documents.reduce((acc, d) => acc + (d.word_count || 0), 0)

    const recentDocs = documents.slice(0, 4)
    const recentSessions = sessions.slice(0, 3)

    const suggestedPrompts = [
        "Summarize the key corporate policies in our documents",
        "What are the employee guidelines and standard procedures?",
        "Explain the compliance and data governance requirements"
    ]

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Welcome & Primary AI Entry Hero */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8 shadow-sm">
                <div className="relative z-10 space-y-6 max-w-3xl">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Enterprise Knowledge Assistant</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                            {getGreeting()}, {firstName}.
                        </h1>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                            Welcome to your intelligent workspace. Query verified company policies, inspect extracted semantic chunks, or converse with EKA using grounded RAG.
                        </p>
                    </div>

                    {/* Large Primary AI Search Box */}
                    <form onSubmit={handleAskSubmit} className="relative">
                        <div className="flex items-center bg-background rounded-xl border border-border focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 shadow-md transition-all p-1.5">
                            <div className="p-2 text-primary">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                value={askQuery}
                                onChange={(e) => setAskQuery(e.target.value)}
                                placeholder="Ask EKA anything about your organization's knowledge..."
                                className="flex-1 bg-transparent px-2 py-2 text-sm md:text-base focus:outline-none text-foreground placeholder:text-muted-foreground"
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                className="gap-2 shadow-sm rounded-lg px-4"
                            >
                                <span>Ask</span>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>

                    {/* Suggested Question Chips */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-xs font-medium text-muted-foreground">Try asking:</span>
                        {suggestedPrompts.map((prompt, idx) => (
                            <button
                                key={idx}
                                onClick={() => navigate(`/chat?q=${encodeURIComponent(prompt)}`)}
                                className="text-xs px-2.5 py-1 rounded-lg bg-background/80 hover:bg-muted border border-border/70 text-foreground transition-colors hover:border-primary/40 truncate max-w-xs"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Knowledge Summary Stats */}
            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Knowledge Repository Overview
                    </h3>
                    <span className="text-xs text-muted-foreground">Live telemetry</span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-border bg-card/70 hover:border-primary/30 transition-all">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <HardDrive className="h-3.5 w-3.5 text-primary" /> Total Documents
                                </span>
                                <p className="text-2xl font-bold text-foreground">
                                    {loading ? "..." : totalDocs}
                                </p>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
                                <FileText className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card/70 hover:border-primary/30 transition-all">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Indexed & Ready
                                </span>
                                <p className="text-2xl font-bold text-foreground">
                                    {loading ? "..." : indexedDocs}
                                </p>
                            </div>
                            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card/70 hover:border-primary/30 transition-all">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <Layers className="h-3.5 w-3.5 text-blue-500" /> Total Chunks
                                </span>
                                <p className="text-2xl font-bold text-foreground">
                                    {loading ? "..." : totalChunks}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                                <Layers className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card/70 hover:border-primary/30 transition-all">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <Hash className="h-3.5 w-3.5 text-purple-500" /> Total Words
                                </span>
                                <p className="text-2xl font-bold text-foreground">
                                    {loading ? "..." : totalWords.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400 shrink-0">
                                <FileCode className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                    onClick={() => navigate("/documents")}
                    className="p-5 rounded-xl border border-border bg-card/80 hover:bg-card hover:border-primary/40 hover:shadow-md transition-all text-left flex items-start gap-4 group"
                >
                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform shrink-0">
                        <UploadCloud className="h-6 w-6" />
                    </div>
                    <div className="space-y-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-1">
                            Knowledge Library
                            <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Upload, parse, and vectorize PDFs, DOCX, TXT, or MD documents.
                        </p>
                    </div>
                </button>

                <button
                    onClick={() => navigate("/search")}
                    className="p-5 rounded-xl border border-border bg-card/80 hover:bg-card hover:border-primary/40 hover:shadow-md transition-all text-left flex items-start gap-4 group"
                >
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                        <Search className="h-6 w-6" />
                    </div>
                    <div className="space-y-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-1">
                            Semantic Search
                            <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Query vector embeddings directly with similarity scores and Top-K control.
                        </p>
                    </div>
                </button>

                <button
                    onClick={() => navigate("/chat")}
                    className="p-5 rounded-xl border border-border bg-card/80 hover:bg-card hover:border-primary/40 hover:shadow-md transition-all text-left flex items-start gap-4 group"
                >
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform shrink-0">
                        <MessageSquare className="h-6 w-6" />
                    </div>
                    <div className="space-y-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-1">
                            AI Workspace
                            <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Converse with grounded RAG and inspect transparent source citations.
                        </p>
                    </div>
                </button>
            </div>

            {/* Bottom 2-Column: Recent Documents & Recent Conversations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Documents Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span>Recent Documents</span>
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/documents")}
                            className="text-xs text-primary gap-1"
                        >
                            <span>View Knowledge Library</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center bg-card rounded-xl border border-border text-xs text-muted-foreground">
                            Loading documents...
                        </div>
                    ) : recentDocs.length === 0 ? (
                        <div className="p-8 text-center bg-card/60 rounded-xl border border-dashed border-border space-y-3">
                            <FileText className="h-8 w-8 mx-auto text-muted-foreground/50" />
                            <p className="text-xs text-muted-foreground">No documents uploaded yet.</p>
                            <Button
                                size="sm"
                                variant="primary"
                                onClick={() => navigate("/documents")}
                                className="text-xs gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Upload Document</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {recentDocs.map((doc) => (
                                <div
                                    key={doc.id}
                                    onClick={() => navigate("/documents")}
                                    className="p-3.5 rounded-xl border border-border bg-card/70 hover:bg-card hover:border-primary/40 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors" title={doc.original_filename || doc.filename}>
                                                {doc.original_filename || doc.filename}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                                                <span>{doc.chunk_count || 0} chunks</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(doc.uploaded_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="shrink-0 flex items-center gap-2">
                                        {doc.status === "Completed" || doc.status === "Chunked" ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                Ready
                                            </span>
                                        ) : doc.status === "Failed" ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-destructive/10 text-destructive border border-destructive/30">
                                                Failed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                                {doc.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Conversations Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            <span>Recent Conversations</span>
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/chat")}
                            className="text-xs text-primary gap-1"
                        >
                            <span>Open Chat</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center bg-card rounded-xl border border-border text-xs text-muted-foreground">
                            Loading conversations...
                        </div>
                    ) : recentSessions.length === 0 ? (
                        <div className="p-8 text-center bg-card/60 rounded-xl border border-dashed border-border space-y-3">
                            <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/50" />
                            <p className="text-xs text-muted-foreground">No recent conversations.</p>
                            <Button
                                size="sm"
                                variant="primary"
                                onClick={() => navigate("/chat")}
                                className="text-xs gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Start Conversation</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {recentSessions.map((session) => (
                                <div
                                    key={session.session_id}
                                    onClick={() => navigate("/chat")}
                                    className="p-3.5 rounded-xl border border-border bg-card/70 hover:bg-card hover:border-primary/40 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                            <MessageSquare className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                                {session.title || "Untitled Session"}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <Clock className="h-3 w-3" />
                                                <span>{new Date(session.updated_at || session.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
