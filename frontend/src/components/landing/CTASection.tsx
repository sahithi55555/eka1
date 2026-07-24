
import { ArrowRight } from "lucide-react"
import { Button } from "../ui/Button"

export const CTASection = () => {
    return (
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
            {/* Background flare */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[500px] bg-white opacity-[0.03] blur-3xl rounded-full"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl mb-6">
                    Ready to unlock your enterprise data?
                </h2>
                <p className="max-w-2xl mx-auto text-lg text-primary-foreground/80 mb-10">
                    Join leading organizations scaling their knowledge retrieval with our precision RAG platform.
                    Deploys in minutes, scales to billions of tokens.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto h-12 px-8 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base border-primary-foreground/20 bg-primary-foreground/10 hover:bg-primary-foreground/20 backdrop-blur">
                        Contact Sales
                    </Button>
                </div>
            </div>
        </section>
    )
}
