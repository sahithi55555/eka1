import { useState, useEffect } from "react"
import {
    Sun,
    Moon,
    Laptop,
    HardDrive,
    Cpu,
    Server,
    CheckCircle2,
    Sliders,
    Sparkles
} from "lucide-react"
import { PageHeader } from "../components/common/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/layout/Card"
import { useTheme } from "../contexts/ThemeContext"

export default function Settings() {
    const { theme, setTheme } = useTheme()
    const [apiHealthy, setApiHealthy] = useState<boolean | null>(null)
    const [topKDefault, setTopKDefault] = useState<number>(5)

    useEffect(() => {
        let isMounted = true
        fetch("http://localhost:8000/api/v1/health")
            .then(res => res.json())
            .then(() => { if (isMounted) setApiHealthy(true) })
            .catch(() => { if (isMounted) setApiHealthy(false) })
        return () => { isMounted = false }
    }, [])

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
            <PageHeader
                title="Settings & Preferences"
                description="Manage interface appearance, search preferences, and review system health."
            />

            {/* Appearance Section */}
            <Card className="border-border bg-card/70">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Sun className="h-4 w-4 text-primary" />
                        <span>Interface Appearance</span>
                    </CardTitle>
                    <CardDescription>
                        Customize the visual theme of the Enterprise Knowledge Assistant workspace.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setTheme("light")}
                            className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2.5 ${
                                theme === "light"
                                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                                    : "border-border hover:border-primary/40 bg-muted/30"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                    <Sun className="h-5 w-5" />
                                </div>
                                {theme === "light" && (
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Light Mode</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Clean, bright workspace</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setTheme("dark")}
                            className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2.5 ${
                                theme === "dark"
                                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                                    : "border-border hover:border-primary/40 bg-muted/30"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                    <Moon className="h-5 w-5" />
                                </div>
                                {theme === "dark" && (
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Dark Mode</p>
                                <p className="text-xs text-muted-foreground mt-0.5">High-contrast slate dark</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setTheme("system")}
                            className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2.5 ${
                                theme === "system"
                                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                                    : "border-border hover:border-primary/40 bg-muted/30"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                    <Laptop className="h-5 w-5" />
                                </div>
                                {theme === "system" && (
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">System Default</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Match operating system</p>
                            </div>
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Retrieval & Search Preferences */}
            <Card className="border-border bg-card/70">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Sliders className="h-4 w-4 text-primary" />
                        <span>Search & Workspace Preferences</span>
                    </CardTitle>
                    <CardDescription>
                        Configure default parameters for vector retrieval and grounded chat.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
                        <div className="space-y-0.5">
                            <label className="text-sm font-semibold text-foreground block">
                                Default Retrieval Depth (Top-K Chunks)
                            </label>
                            <p className="text-xs text-muted-foreground">
                                Number of relevant chunks retrieved from the vector database for questions.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={topKDefault}
                                onChange={(e) => setTopKDefault(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))}
                                className="w-20 px-3 py-1.5 text-sm rounded-lg border border-input bg-background text-foreground text-center font-mono font-semibold"
                            />
                            <span className="text-xs text-muted-foreground font-medium">chunks</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* System Status & Diagnostics */}
            <Card className="border-border bg-card/70">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Server className="h-4 w-4 text-primary" />
                        <span>Platform Diagnostics & Infrastructure</span>
                    </CardTitle>
                    <CardDescription>
                        Real-time status of backend microservices, vector storage, and AI components.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Server className="h-3.5 w-3.5 text-primary" /> Backend API
                            </span>
                            <div className="flex items-center gap-2">
                                <div className={`h-2.5 w-2.5 rounded-full ${apiHealthy === true ? "bg-emerald-500" : apiHealthy === false ? "bg-rose-500" : "bg-amber-500 animate-pulse"}`} />
                                <span className="text-xs font-semibold text-foreground">
                                    {apiHealthy === true ? "Operational (200 OK)" : apiHealthy === false ? "Unreachable" : "Checking..."}
                                </span>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <HardDrive className="h-3.5 w-3.5 text-blue-500" /> Vector Database
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                <span className="text-xs font-semibold text-foreground">ChromaDB Local</span>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Cpu className="h-3.5 w-3.5 text-purple-500" /> Embedder Model
                            </span>
                            <p className="text-xs font-semibold text-foreground truncate" title="all-MiniLM-L6-v2 (384-dim)">
                                all-MiniLM-L6-v2
                            </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Grounded RAG
                            </span>
                            <p className="text-xs font-semibold text-foreground">
                                Active Pipeline
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
