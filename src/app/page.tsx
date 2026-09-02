import SiteHeader from "@/components/landing/SiteHeader";
import Hero from "@/components/landing/Hero";
import NyscSection from "@/components/landing/NyscSection";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturesSection from "@/components/landing/FeaturesSection";
import UniversitiesSection from "@/components/landing/UniversitiesSection";
import SiteFooter from "@/components/landing/SiteFooter";

export default function HomePage() {
  return (
    <div className="hero-wash min-h-screen bg-white">
      <SiteHeader />
      <main>
        <Hero />
        <NyscSection />
        <HowItWorks />
        <FeaturesSection />
        <UniversitiesSection />
      </main>
      <SiteFooter />
    </div>
  );
}
