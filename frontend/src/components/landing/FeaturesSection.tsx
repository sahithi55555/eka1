
import { FileText, Search, Database, Bot, Wrench, BarChart3 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../layout/Card"

const features = [
    {
        title: "Upload Documents",
        description: "Securely upload PDFs, Word documents, presentations, and other enterprise knowledge sources to build your organization's AI knowledge base.",
        icon: FileText,
    },
    {
        title: "Find Information",
        description: "Quickly locate the right information across all your enterprise documents using natural language search.",
        icon: Search,
    },
    {
        title: "Ask AI",
        description: "Ask questions in plain English and receive accurate, context-aware answers grounded in your organization's knowledge.",
        icon: Database,
    },
    {
        title: "Automate Work",
        description: "Automate repetitive tasks, streamline workflows, and let AI assist with everyday business operations.",
        icon: Bot,
    },
    {
        title: "Connect Apps",
        description: "Connect your business applications, internal systems, and APIs to create a unified AI workspace.",
        icon: Wrench,
    },
    {
        title: "Insights & Analytics",
        description: "Monitor AI adoption, usage, performance, and organizational activity through a centralized analytics dashboard.",
        icon: BarChart3,
    },
]

export const FeaturesSection = () => {
    return (
        <section id="features" className="py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                        Enterprise-Grade Capabilities
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Everything you need to build, deploy, and scale intelligent AI applications on top of your proprietary data.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <Card key={index} className="border bg-background/50 backdrop-blur transition-all duration-200 hover:shadow-md hover:border-primary/20">
                                <CardHeader>
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
