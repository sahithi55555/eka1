
import { ArrowRight, UploadCloud, Cpu, Layers, Search, BrainCircuit, MessageSquare } from "lucide-react"

const steps = [
    { id: "01", title: "Upload", icon: UploadCloud, desc: "Connect data sources" },
    { id: "02", title: "Process", icon: Layers, desc: "Parse & Chunk" },
    { id: "03", title: "Embed", icon: Cpu, desc: "Vectorization" },
    { id: "04", title: "Search", icon: Search, desc: "Semantic retrieval" },
    { id: "05", title: "Reason", icon: BrainCircuit, desc: "LLM synthesis" },
    { id: "06", title: "Answer", icon: MessageSquare, desc: "Deliver response" },
]

export const WorkflowSection = () => {
    return (
        <section className="py-24 border-y bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        How EKA Works
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        A seamless, un-opinionated data pipeline from ingestion to intelligent delivery.
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting Line (hidden on mobile, visible on lg screens) */}
                    <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 -z-10"></div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-4 relative z-0">
                        {steps.map((step, index) => {
                            const Icon = step.icon
                            return (
                                <div key={index} className="flex flex-col items-center text-center group">
                                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 shadow-sm">
                                        {index < steps.length - 1 && (
                                            <ArrowRight className="absolute -right-8 h-4 w-4 text-muted-foreground lg:hidden" />
                                        )}
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
