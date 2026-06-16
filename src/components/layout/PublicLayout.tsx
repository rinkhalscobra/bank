import { Routes, Route } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import Home from '../../pages/Home';
import Services from '../../pages/Services';
import About from '../../pages/About';
import BusinessBanking from '../../pages/BusinessBanking';
import Cards from '../../pages/Cards';
import Loans from '../../pages/Loans';
import Investments from '../../pages/Investments';
import International from '../../pages/International';
import OnlineBanking from '../../pages/OnlineBanking';
import AuthRoute from '../../routes/AuthRoute';
import PrivacyPolicy from '../../pages/PrivacyPolicy';
import TermsOfService from '../../pages/TermsOfService';
import Disclosures from '../../pages/Disclosures';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/business-banking" element={<BusinessBanking />} />
          <Route path="/cards" element={<Cards />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/international" element={<International />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/disclosures" element={<Disclosures />} />
          <Route
            path="/online-banking"
            element={
              <AuthRoute>
                <OnlineBanking />
              </AuthRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
