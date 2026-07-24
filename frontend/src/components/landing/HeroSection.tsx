
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"

export const HeroSection = () => {
    return (
        <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32">
            {/* Background gradients */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <Badge variant="outline" className="mb-6 rounded-full px-4 py-1.5 inline-flex items-center gap-2 border-primary/20 bg-primary/5 text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>EKA Platform 1.0 is now live</span>
                </Badge>

                <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                    The Intelligent Backbone for <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Enterprise Knowledge</span>
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
                    Unlock your organization's data with an advanced Retrieval-Augmented Generation platform. Built for scale, security, and precision.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" className="w-full sm:w-auto gap-2 rounded-full px-8">
                        Start Building <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8">
                        View Documentation
                    </Button>
                </div>

                {/* Dashboard illustration placeholder */}
                <div className="mx-auto mt-16 max-w-6xl rounded-xl border bg-card shadow-2xl p-2 relative overflow-hidden sm:mt-24">
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 bottom-0 top-3/4"></div>
                    <div className="rounded-lg border bg-muted/30 overflow-hidden flex flex-col aspect-video">
                        <div className="flex h-10 items-center justify-between border-b bg-background px-4">
                            <div className="flex space-x-1.5">
                                <div className="h-3 w-3 rounded-full bg-red-400"></div>
                                <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                                <div className="h-3 w-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="h-4 w-1/3 rounded bg-muted"></div>
                            <div className="h-6 w-6 rounded bg-muted"></div>
                        </div>
                        <div className="flex flex-1 p-4 gap-4">
                            <div className="w-48 hidden md:flex flex-col gap-2">
                                <div className="h-8 w-full rounded bg-background border"></div>
                                <div className="h-8 w-full rounded bg-background border"></div>
                                <div className="h-8 w-full rounded bg-muted/50 border"></div>
                                <div className="h-8 w-full rounded bg-muted/50 border"></div>
                            </div>
                            <div className="flex-1 rounded border bg-background flex flex-col p-4 shadow-sm">
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/20 shrink-0"></div>
                                    <div className="space-y-2 w-full max-w-md">
                                        <div className="h-4 w-full rounded bg-muted"></div>
                                        <div className="h-4 w-4/5 rounded bg-muted"></div>
                                    </div>
                                </div>
                                <div className="mt-8 flex gap-4 flex-row-reverse">
                                    <div className="h-10 w-10 rounded-full bg-accent/20 shrink-0"></div>
                                    <div className="space-y-2 w-full max-w-md flex flex-col items-end">
                                        <div className="h-4 w-full rounded bg-primary/10"></div>
                                        <div className="h-4 w-3/4 rounded bg-primary/10"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
