
import { CheckCircle2, Circle, Clock } from "lucide-react"

const milestones = [
    {
        phase: "Sprint 1",
        title: "Foundation & UI Shell",
        status: "completed",
        items: ["React & Vite scaffolding", "Tailwind Design System", "Dashboard layout", "Authentication logic"],
    },
    {
        phase: "Sprint 2",
        title: "Document & Rag Core",
        status: "completed",
        items: ["FastAPI Backend Setup", "Vector DB Integration", "Document Processing Pipeline", "Basic Retrieval"],
    },
    {
        phase: "Sprint 3",
        title: "Landing Page & Polish",
        status: "current",
        items: ["Marketing Landing Page", "Animations & Transitions", "Responsive Fixes", "Dark/Light mode updates"],
    },
    {
        phase: "Sprint 4",
        title: "AI Agents & Tool Calling",
        status: "upcoming",
        items: ["Multi-agent Architecture", "Dynamic Dashboard Widgets", "Custom tool registry", "Enterprise analytics"],
    },
]

export const RoadmapSection = () => {
    return (
        <section id="roadmap" className="py-24 bg-muted/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                        Development Roadmap
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Our commitment to continuous innovation.
                    </p>
                </div>

                <div className="space-y-8">
                    {milestones.map((milestone, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-6 md:gap-12 relative group">
                            {/* Timeline Line */}
                            {index !== milestones.length - 1 && (
                                <div className="hidden md:block absolute left-[12.5rem] top-10 bottom-[-2rem] w-px bg-border group-hover:bg-primary/30 transition-colors"></div>
                            )}

                            <div className="md:w-48 flex shrink-0 md:justify-end items-start md:pt-1">
                                <span className="font-semibold text-lg text-foreground">{milestone.phase}</span>
                            </div>

                            <div className="flex flex-1 gap-4 items-start">
                                <div className="shrink-0 mt-1 md:mt-2 relative z-10 bg-muted/20">
                                    {milestone.status === "completed" && (
                                        <CheckCircle2 className="h-6 w-6 text-primary" />
                                    )}
                                    {milestone.status === "current" && (
                                        <span className="relative flex h-6 w-6">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                            <Circle className="relative inline-flex rounded-full h-6 w-6 text-accent fill-accent" />
                                        </span>
                                    )}
                                    {milestone.status === "upcoming" && (
                                        <Clock className="h-6 w-6 text-muted-foreground" />
                                    )}
                                </div>

                                <div className="pb-8">
                                    <h3 className="text-xl font-bold mb-3">{milestone.title}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                                        {milestone.items.map((item, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-border" />
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
