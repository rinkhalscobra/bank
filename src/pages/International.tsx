import '../i18n/international';
import InternationalHero from '../components/international/InternationalHero';
import InternationalCoreServices from '../components/international/InternationalCoreServices';
import TransferProcess from '../components/international/TransferProcess';
import TradeFinance from '../components/international/TradeFinance';
import InternationalAdditionalServices from '../components/international/InternationalAdditionalServices';
import GlobalMobility from '../components/international/GlobalMobility';
import InternationalFAQ from '../components/international/InternationalFAQ';

export default function International() {
  return (
    <>
      <InternationalHero />
      <InternationalCoreServices />
      <TransferProcess />
      <TradeFinance />
      <InternationalAdditionalServices />
      <GlobalMobility />
      <InternationalFAQ />
    </>
  );
}
