
import { Monitor, Cpu, Database, Cloud } from "lucide-react"

const stacks = [
    {
        category: "Frontend",
        icon: Monitor,
        techs: ["React 19", "Vite", "Tailwind CSS", "React Router", "Lucide Icons"],
    },
    {
        category: "Backend",
        icon: Cpu,
        techs: ["Python 3.10", "FastAPI", "Pydantic", "Uvicorn", "LangChain"],
    },
    {
        category: "Database & Models",
        icon: Database,
        techs: ["MongoDB", "Pinecone/Chroma", "OpenAI / Anthropic", "Hugging Face"],
    },
    {
        category: "Infrastructure",
        icon: Cloud,
        techs: ["Docker", "GitHub Actions", "Vercel / AWS", "Sentry"],
    },
]

export const TechStackSection = () => {
    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Technology Stack
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Powered by modern, production-grade tools and frameworks.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stacks.map((stack, i) => {
                        const Icon = stack.icon
                        return (
                            <div key={i} className="rounded-xl border bg-card p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-muted h-10 w-10 flex flex-shrink-0 items-center justify-center rounded-lg ring-1 ring-border">
                                        <Icon className="h-5 w-5 text-foreground" />
                                    </div>
                                    <h3 className="font-semibold text-lg">{stack.category}</h3>
                                </div>
                                <ul className="space-y-3">
                                    {stack.techs.map((tech, j) => (
                                        <li key={j} className="flex items-center gap-2 text-muted-foreground">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary/60"></div>
                                            {tech}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
