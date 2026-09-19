import { useEffect, useState } from "react"
import { PageHeader } from "../components/common/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/layout/Card"
import { documentService, type Document } from "../features/documents/services/documentService"
import { chatService, type ChatSession } from "../features/chat/services/chatService"
import {
    BarChart3,
    FileText,
    Layers,
    MessageSquare,
    HardDrive,
    Zap,
    Cpu,
    CheckCircle2
} from "lucide-react"

export default function Analytics() {
    const [documents, setDocuments] = useState<Document[]>([])
    const [sessions, setSessions] = useState<ChatSession[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true
        Promise.all([
            documentService.fetchDocuments().catch(() => []),
            chatService.getSessions().catch(() => [])
        ]).then(([docs, sess]) => {
            if (isMounted) {
                setDocuments(docs)
                setSessions(sess)
                setLoading(false)
            }
        })
        return () => { isMounted = false }
    }, [])

    const totalDocs = documents.length
    const readyDocs = documents.filter(d => d.status === "Completed" || d.status === "Chunked").length
    const processingDocs = documents.filter(d => ["Parsing", "Cleaning", "Chunking", "Embedding", "Indexing", "Processing"].includes(d.status)).length
    const failedDocs = documents.filter(d => d.status === "Failed").length

    const totalChunks = documents.reduce((sum, d) => sum + (d.chunk_count || 0), 0)
    const totalWords = documents.reduce((sum, d) => sum + (d.word_count || 0), 0)
    const totalSizeBytes = documents.reduce((sum, d) => sum + (d.file_size || 0), 0)
    const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2)

    // Document types breakdown
    const typeCounts: Record<string, number> = {}
    documents.forEach(d => {
        const ext = d.file_type ? d.file_type.toUpperCase().replace(".", "") : "TXT"
        typeCounts[ext] = (typeCounts[ext] || 0) + 1
    })

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
            <PageHeader
                title="Insights & Analytics"
                description="Live telemetry of organizational knowledge indexing, storage distribution, and conversational queries."
            />

            {/* Key Telemetry Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-border bg-card shadow-sm">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Total Documents
                            </p>
                            <p className="text-2xl font-black mt-1 text-foreground">
                                {loading ? "—" : totalDocs}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                {readyDocs} ready • {processingDocs} in flight {failedDocs > 0 ? `• ${failedDocs} failed` : ""}
                            </p>
                        </div>
                        <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-sm">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Vector Chunks
                            </p>
                            <p className="text-2xl font-black mt-1 text-foreground">
                                {loading ? "—" : totalChunks.toLocaleString()}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                {loading ? "—" : `${totalWords.toLocaleString()} words indexed`}
                            </p>
                        </div>
                        <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <Layers className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-sm">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Active Chat Sessions
                            </p>
                            <p className="text-2xl font-black mt-1 text-foreground">
                                {loading ? "—" : sessions.length}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                                <Zap className="h-3 w-3 text-amber-500" />
                                Grounded RAG queries
                            </p>
                        </div>
                        <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-sm">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Storage Volume
                            </p>
                            <p className="text-2xl font-black mt-1 text-foreground">
                                {loading ? "—" : `${totalSizeMB} MB`}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                ChromaDB Vector Store
                            </p>
                        </div>
                        <div className="h-11 w-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                            <HardDrive className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Document Format Distribution */}
                <Card className="border-border bg-card shadow-sm lg:col-span-1">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-primary" />
                            Format Distribution
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Types of documents indexed in your repository
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {Object.keys(typeCounts).length === 0 ? (
                            <p className="text-xs text-muted-foreground italic py-4 text-center">
                                No documents indexed yet.
                            </p>
                        ) : (
                            Object.entries(typeCounts).map(([ext, count]) => {
                                const percent = totalDocs > 0 ? Math.round((count / totalDocs) * 100) : 0
                                return (
                                    <div key={ext} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-foreground">{ext} Documents</span>
                                            <span className="text-muted-foreground">{count} ({percent}%)</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all duration-500"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </CardContent>
                </Card>

                {/* Pipeline Performance Architecture */}
                <Card className="border-border bg-card shadow-sm lg:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-primary" />
                            Retrieval & Embedding Pipeline Architecture
                        </CardTitle>
                        <CardDescription className="text-xs">
                            System specifications and runtime parameters
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-1">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Embedding Model
                            </span>
                            <p className="text-sm font-bold text-foreground">text-embedding-004</p>
                            <p className="text-xs text-muted-foreground">768-dimensional dense vector embeddings</p>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-1">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Vector Engine
                            </span>
                            <p className="text-sm font-bold text-foreground">ChromaDB Persistent</p>
                            <p className="text-xs text-muted-foreground">HNSW approximate nearest neighbor index</p>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-1">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Chunking Specification
                            </span>
                            <p className="text-sm font-bold text-foreground">500 Tokens / 50 Overlap</p>
                            <p className="text-xs text-muted-foreground">Context-preserving semantic chunking</p>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-1">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Generation LLM
                            </span>
                            <p className="text-sm font-bold text-foreground">Google Gemini 1.5</p>
                            <p className="text-xs text-muted-foreground">Grounded synthesis with verifiable citations</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
