import { Server, MonitorPlay, Code2, Database, BrainCircuit } from "lucide-react"

export const ArchitectureSection = () => {
    return (
        <section id="architecture" className="py-24 bg-muted/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                        Built for the Built Environment
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Our architecture is modular by design, allowing seamless integration with your existing infrastructure.
                    </p>
                </div>

                {/* Architecture visualization */}
                <div className="relative mx-auto max-w-5xl">
                    <div className="hidden lg:flex absolute top-1/2 left-0 w-full justify-between -translate-y-1/2 z-0 px-24">
                        <div className="flex-1 border-t-2 border-dashed border-primary/30"></div>
                        <div className="flex-1 border-t-2 border-dashed border-primary/30"></div>
                        <div className="flex-1 border-t-2 border-dashed border-primary/30"></div>
                        <div className="flex-1 border-t-2 border-dashed border-primary/30"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4 relative z-10">
                        {/* Box 1 */}
                        <div className="flex flex-col items-center bg-card rounded-xl border shadow-sm p-6 text-center">
                            <div className="bg-blue-500/10 text-blue-500 h-14 w-14 rounded-full flex items-center justify-center mb-4">
                                <MonitorPlay className="h-7 w-7" />
                            </div>
                            <h3 className="font-semibold text-foreground">React Frontend</h3>
                            <p className="text-sm text-muted-foreground mt-2">Vite, Tailwind, Design System</p>
                        </div>

                        {/* Box 2 */}
                        <div className="flex flex-col items-center bg-card rounded-xl border shadow-sm p-6 text-center">
                            <div className="bg-emerald-500/10 text-emerald-500 h-14 w-14 rounded-full flex items-center justify-center mb-4">
                                <Server className="h-7 w-7" />
                            </div>
                            <h3 className="font-semibold text-foreground">FastAPI Backend</h3>
                            <p className="text-sm text-muted-foreground mt-2">Python, Async, WebSocket</p>
                        </div>

                        {/* Box 3 */}
                        <div className="flex flex-col items-center bg-card rounded-xl border shadow-sm p-6 text-center">
                            <div className="bg-amber-500/10 text-amber-500 h-14 w-14 rounded-full flex items-center justify-center mb-4">
                                <Code2 className="h-7 w-7" />
                            </div>
                            <h3 className="font-semibold text-foreground">Data Processing</h3>
                            <p className="text-sm text-muted-foreground mt-2">Chunking, OCR, Parsing</p>
                        </div>

                        {/* Box 4 */}
                        <div className="flex flex-col items-center bg-card rounded-xl border shadow-sm p-6 text-center">
                            <div className="bg-violet-500/10 text-violet-500 h-14 w-14 rounded-full flex items-center justify-center mb-4">
                                <Database className="h-7 w-7" />
                            </div>
                            <h3 className="font-semibold text-foreground">Vector Database</h3>
                            <p className="text-sm text-muted-foreground mt-2">Embeddings, Similarity</p>
                        </div>

                        {/* Box 5 */}
                        <div className="flex flex-col items-center bg-primary text-primary-foreground rounded-xl shadow-lg p-6 text-center scale-105 border-0">
                            <div className="bg-primary-foreground/20 h-14 w-14 rounded-full flex items-center justify-center mb-4">
                                <BrainCircuit className="h-7 w-7" />
                            </div>
                            <h3 className="font-semibold">LLM Orchestration</h3>
                            <p className="text-sm text-primary-foreground/80 mt-2">Provider Agnostic, Agents</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
