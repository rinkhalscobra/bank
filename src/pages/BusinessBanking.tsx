import '../i18n/business';
import BusinessHero from '../components/business/BusinessHero';
import BusinessRatings from '../components/business/BusinessRatings';
import BusinessFAQ from '../components/business/BusinessFAQ';
import BusinessSteps from '../components/business/BusinessSteps';
import BusinessServices from '../components/business/BusinessServices';

export default function BusinessBanking() {
  return (
    <>
      <BusinessHero />
      <BusinessRatings />
      <BusinessServices />
      <BusinessFAQ />
      <BusinessSteps />
    </>
  );
}
