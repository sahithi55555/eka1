import { useState } from "react"
import { PageHeader } from "../components/common/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/layout/Card"
import { Button } from "../components/ui/Button"
import {
    Puzzle,
    FolderKanban,
    MessageSquare,
    Code2,
    CheckCircle2,
    ExternalLink
} from "lucide-react"

interface ToolConnector {
    name: string
    category: "storage" | "collaboration" | "developer"
    description: string
    status: "Beta" | "In Development" | "Planned"
    iconBg: string
}

export default function ConnectTools() {
    const [requestedTools, setRequestedTools] = useState<Set<string>>(new Set())

    const toggleRequest = (toolName: string) => {
        setRequestedTools((prev) => {
            const next = new Set(prev)
            if (next.has(toolName)) next.delete(toolName)
            else next.add(toolName)
            return next
        })
    }

    const connectors: ToolConnector[] = [
        {
            name: "Google Drive",
            category: "storage",
            description: "Automatically sync Google Docs, PDFs, and slide decks from shared team drives.",
            status: "Beta",
            iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
        },
        {
            name: "Notion Workspaces",
            category: "storage",
            description: "Ingest company wikis, SOPs, and engineering playbooks directly into vector embeddings.",
            status: "In Development",
            iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
        },
        {
            name: "Confluence",
            category: "storage",
            description: "Synchronize Atlassian Confluence spaces and knowledge bases with RBAC permission filtering.",
            status: "In Development",
            iconBg: "bg-blue-600/10 text-blue-700 dark:text-blue-300"
        },
        {
            name: "Slack",
            category: "collaboration",
            description: "Deploy EKA as an intelligent bot in public Slack channels to answer staff inquiries with citations.",
            status: "In Development",
            iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400"
        },
        {
            name: "Microsoft Teams",
            category: "collaboration",
            description: "Interact with the EKA Assistant inside Microsoft Teams tabs and direct messages.",
            status: "Planned",
            iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
        },
        {
            name: "GitHub Repositories",
            category: "developer",
            description: "Index Markdown documentation, READMEs, architecture RFCs, and API specifications.",
            status: "Planned",
            iconBg: "bg-slate-500/10 text-slate-700 dark:text-slate-300"
        }
    ]

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
            <PageHeader
                title="Connect Your Tools"
                description="Integrate enterprise cloud drives, team wikis, and messaging channels directly into EKA's retrieval pipeline."
            />

            {/* Notice banner */}
            <div className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Puzzle className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">Enterprise Integrations Directory</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Direct file upload (PDF, DOCX, TXT, MD) is currently active in the Knowledge Library. Cloud connector integrations are rolling out next.
                        </p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open("https://github.com", "_blank")}
                    className="shrink-0 text-xs gap-1.5"
                >
                    API Documentation <ExternalLink className="h-3 w-3" />
                </Button>
            </div>

            {/* Connectors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connectors.map((connector) => {
                    const isRequested = requestedTools.has(connector.name)
                    return (
                        <Card key={connector.name} className="border-border bg-card hover:border-primary/30 transition-all flex flex-col justify-between shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${connector.iconBg}`}>
                                        {connector.category === "storage" ? (
                                            <FolderKanban className="h-5 w-5" />
                                        ) : connector.category === "collaboration" ? (
                                            <MessageSquare className="h-5 w-5" />
                                        ) : (
                                            <Code2 className="h-5 w-5" />
                                        )}
                                    </div>
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                                        {connector.status}
                                    </span>
                                </div>
                                <CardTitle className="text-sm font-bold mt-2 text-foreground">
                                    {connector.name}
                                </CardTitle>
                                <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                                    {connector.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="pt-2 border-t border-border/50">
                                <Button
                                    variant={isRequested ? "outline" : "secondary"}
                                    size="sm"
                                    onClick={() => toggleRequest(connector.name)}
                                    className="w-full text-xs font-semibold"
                                >
                                    {isRequested ? (
                                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> Integration Requested
                                        </span>
                                    ) : (
                                        "Request Connector"
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
