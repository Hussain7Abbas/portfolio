import { Features } from "@/components/features";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { OpenSourceCta } from "@/components/open-source-cta";
import { TemplatesShowcase } from "@/components/templates-showcase";

export default function Page() {
  return (
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      <TemplatesShowcase />
      <OpenSourceCta />
    </main>
  );
}
