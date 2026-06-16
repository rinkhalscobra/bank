import '../i18n/about';
import AboutHero from '../components/about/AboutHero';
import OurStory from '../components/about/OurStory';
import MissionValues from '../components/about/MissionValues';
import KeyStats from '../components/about/KeyStats';
import CommunityImpact from '../components/about/CommunityImpact';
import AboutCTA from '../components/about/AboutCTA';

export default function About() {
  return (
    <>
      <AboutHero />
      <OurStory />
      <MissionValues />
      <KeyStats />
      <CommunityImpact />
      <AboutCTA />
    </>
  );
}
