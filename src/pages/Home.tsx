import '../i18n/home';
import HeroSection from '../components/home/HeroSection';
import TrustIndicators from '../components/home/TrustIndicators';
import ServicesSection from '../components/home/ServicesSection';
import CurrenciesSection from '../components/home/CurrenciesSection';
import WhyChooseSection from '../components/home/WhyChooseSection';
import TestimonialsSection from '../components/home/TestimonialsSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustIndicators />
      <ServicesSection />
      <CurrenciesSection />
      <WhyChooseSection />
      <TestimonialsSection />
    </>
  );
}
