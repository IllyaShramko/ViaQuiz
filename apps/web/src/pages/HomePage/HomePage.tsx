import {
  HeroSection,
  QuizzesSection,
  FeaturesSection,
  HowItWorksSection,
  CtaSection,
  Footer,
} from '../../modules/home/ui';
import './HomePage.css';

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
