
import { ShieldCheck, Zap, Settings2 } from "lucide-react"

export const WhyEKASection = () => {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                            Why Choose EKA?
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            We built EKA manually from the ground up, avoiding bloated abstraction layers. The result is a highly performant, predictable, and customizable enterprise system capable of passing rigorous security reviews.
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold mb-1">Production-Ready Engineering</h4>
                                    <p className="text-muted-foreground">Tested against edge cases, token limits, and concurrent user loads. Real security, no shortcuts.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                                    <Settings2 className="h-6 w-6 text-accent" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold mb-1">Provider-Independent Design</h4>
                                    <p className="text-muted-foreground">Swap out OpenAI, Anthropic, or local open-source models with entirely modular abstractions.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <Zap className="h-6 w-6 text-emerald-500" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold mb-1">Manual Implementation Priority</h4>
                                    <p className="text-muted-foreground">Logic over libraries. We prefer explicit control over the full stack over opaque "black box" defaults.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative rounded-2xl bg-muted p-8 overflow-hidden">
                        {/* Simple abstract decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

                        <div className="relative bg-background rounded-xl border shadow-sm p-6 overflow-hidden">
                            <div className="flex gap-2 mb-4 border-b pb-4">
                                <div className="h-3 w-3 rounded-full bg-red-400"></div>
                                <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                                <div className="h-3 w-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="space-y-4 font-mono text-sm">
                                <div className="text-muted-foreground">{"// EKA configuration snippet"}</div>
                                <div>
                                    <span className="text-primary">const</span> config = {"{"}
                                </div>
                                <div className="pl-4">
                                    orchestrator: <span className="text-accent">"hybrid"</span>,
                                    <br />
                                    retrieval: <span className="text-accent">"semantic-first"</span>,
                                    <br />
                                    <span className="text-muted-foreground">{"// Custom integrations fully supported"}</span>
                                    <br />
                                    embedding_model: <span className="text-accent">"text-embedding-3-large"</span>
                                </div>
                                <div>{"}"}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
