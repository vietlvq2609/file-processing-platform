import { HeroSection } from '../features/landing/components/HeroSection';
import { HowItWorksSection } from '../features/landing/components/HowItWorksSection';
import { SignupCtaSection } from '../features/landing/components/SignupCtaSection';
import { ToolShowcaseSection } from '../features/landing/components/ToolShowcaseSection';

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <HowItWorksSection />
      <ToolShowcaseSection />
      <SignupCtaSection />
    </main>
  );
}
