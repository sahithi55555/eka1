
import { LandingNav } from "../components/landing/LandingNav"
import { HeroSection } from "../components/landing/HeroSection"
import { FeaturesSection } from "../components/landing/FeaturesSection"
import { WorkflowSection } from "../components/landing/WorkflowSection"
import { ArchitectureSection } from "../components/landing/ArchitectureSection"
import { TechStackSection } from "../components/landing/TechStackSection"
import { RoadmapSection } from "../components/landing/RoadmapSection"
import { WhyEKASection } from "../components/landing/WhyEKASection"
import { CTASection } from "../components/landing/CTASection"
import { LandingFooter } from "../components/landing/LandingFooter"

export const Landing = () => {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
            <LandingNav />

            <main className="flex-1">
                <HeroSection />
                <FeaturesSection />
                <WorkflowSection />
                <ArchitectureSection />
                <TechStackSection />
                <RoadmapSection />
                <WhyEKASection />
                <CTASection />
            </main>

            <LandingFooter />
        </div>
    )
}

export default Landing
