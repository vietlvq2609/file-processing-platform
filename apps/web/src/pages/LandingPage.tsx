import { HeroSection } from '../features/landing/components/HeroSection';
import { HowItWorksSection } from '../features/landing/components/HowItWorksSection';
import { SignupCtaSection } from '../features/landing/components/SignupCtaSection';
import { ToolShowcaseSection } from '../features/landing/components/ToolShowcaseSection';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function LandingPage() {
  useDocumentTitle('FileProc — Process files instantly');
  return (
    <main>
      <HeroSection />
      <HowItWorksSection />
      <ToolShowcaseSection />
      <SignupCtaSection />
    </main>
  );
}
