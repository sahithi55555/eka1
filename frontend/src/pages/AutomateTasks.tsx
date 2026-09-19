import { useState } from "react"
import { PageHeader } from "../components/common/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/layout/Card"
import { Button } from "../components/ui/Button"
import {
    Zap,
    Clock,
    FileCheck2,
    Share2,
    Calendar,
    Sparkles,
    CheckCircle2,
    BellRing
} from "lucide-react"

export default function AutomateTasks() {
    const [notified, setNotified] = useState(false)

    const upcomingWorkflows = [
        {
            title: "Scheduled Knowledge Digests",
            description: "Automatically generate weekly executive briefings from newly indexed documents and distribute them via email.",
            icon: <Calendar className="h-5 w-5 text-primary" />,
            badge: "In Development",
            trigger: "Weekly Schedule"
        },
        {
            title: "Automated Policy Verification",
            description: "Run continuous cross-referencing scans when new compliance documents are uploaded to flag policy discrepancies.",
            icon: <FileCheck2 className="h-5 w-5 text-emerald-500" />,
            badge: "Q3 2026",
            trigger: "On Document Upload"
        },
        {
            title: "Multi-Source Sync & Re-indexing",
            description: "Keep ChromaDB vector stores synchronized with changes in shared cloud drives and document repositories.",
            icon: <Share2 className="h-5 w-5 text-blue-500" />,
            badge: "Planned",
            trigger: "Continuous Webhook"
        },
        {
            title: "Autonomous Research Agents",
            description: "Spawn multi-step synthesis tasks that query organizational knowledge and draft structured reports.",
            icon: <Sparkles className="h-5 w-5 text-purple-500" />,
            badge: "Planned",
            trigger: "Custom Prompt Trigger"
        }
    ]

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
            <PageHeader
                title="Automate Tasks"
                description="Streamline organizational workflows, automated knowledge digests, and continuous document synchronization."
            />

            {/* Roadmap Notice Banner */}
            <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-foreground">Task Automation Engine</h3>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                Coming Soon
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-2xl">
                            We are finalizing the autonomous workflow scheduler to let you trigger recurrent RAG syntheses, policy compliance scans, and team notification pipelines directly from your knowledge base.
                        </p>
                    </div>
                </div>

                <Button
                    variant={notified ? "outline" : "primary"}
                    size="sm"
                    onClick={() => setNotified(true)}
                    className="shrink-0 text-xs font-semibold"
                >
                    {notified ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Notification Set
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5">
                            <BellRing className="h-3.5 w-3.5" /> Notify When Live
                        </span>
                    )}
                </Button>
            </div>

            {/* Upcoming Automation Capabilities Grid */}
            <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
                    Planned Workflow Recipes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingWorkflows.map((item, index) => (
                        <Card key={index} className="border-border bg-card hover:border-primary/30 transition-all shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
                                        {item.icon}
                                    </div>
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                                        {item.badge}
                                    </span>
                                </div>
                                <CardTitle className="text-sm font-bold mt-2 text-foreground">
                                    {item.title}
                                </CardTitle>
                                <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                                    {item.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground py-2.5">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" /> Trigger: {item.trigger}
                                </span>
                                <span className="font-semibold text-primary/80">Preview</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
