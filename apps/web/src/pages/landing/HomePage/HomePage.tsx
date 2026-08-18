import {
  HeroSection,
  QuizzesSection,
  FeaturesSection,
  HowItWorksSection,
  CtaSection,
  Footer,
} from '../../../modules/home/ui';

export function HomePage() {
  return (
    <div className="homepage">
      <HeroSection />
      <QuizzesSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
