import { CreditCard, TrendingUp, Building2 } from 'lucide-react';

export default function Services() {
  return (
    <section className="py-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-serif font-bold text-slate-900 mb-4">Our Services</h3>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Comprehensive financial solutions tailored to your needs
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white border-2 border-slate-200 p-8 hover:border-amber-600 hover:shadow-xl transition-all duration-300">
            <div className="bg-slate-900 w-16 h-16 flex items-center justify-center mb-6">
              <CreditCard className="w-8 h-8 text-amber-500" />
            </div>
            <h4 className="text-2xl font-serif font-bold text-slate-900 mb-4">Personal Banking</h4>
            <p className="text-slate-600 leading-relaxed mb-6">
              Checking and savings accounts with competitive rates, personalized service, and modern convenience.
            </p>
            <a href="#" className="text-amber-700 font-semibold hover:text-amber-800 inline-flex items-center">
              Learn More →
            </a>
          </div>
          <div className="bg-white border-2 border-slate-200 p-8 hover:border-amber-600 hover:shadow-xl transition-all duration-300">
            <div className="bg-slate-900 w-16 h-16 flex items-center justify-center mb-6">
              <TrendingUp className="w-8 h-8 text-amber-500" />
            </div>
            <h4 className="text-2xl font-serif font-bold text-slate-900 mb-4">Wealth Management</h4>
            <p className="text-slate-600 leading-relaxed mb-6">
              Strategic investment planning and portfolio management to help you build and preserve wealth.
            </p>
            <a href="#" className="text-amber-700 font-semibold hover:text-amber-800 inline-flex items-center">
              Learn More →
            </a>
          </div>
          <div className="bg-white border-2 border-slate-200 p-8 hover:border-amber-600 hover:shadow-xl transition-all duration-300">
            <div className="bg-slate-900 w-16 h-16 flex items-center justify-center mb-6">
              <Building2 className="w-8 h-8 text-amber-500" />
            </div>
            <h4 className="text-2xl font-serif font-bold text-slate-900 mb-4">Business Banking</h4>
            <p className="text-slate-600 leading-relaxed mb-6">
              Comprehensive solutions for businesses of all sizes, from startups to established enterprises.
            </p>
            <a href="#" className="text-amber-700 font-semibold hover:text-amber-800 inline-flex items-center">
              Learn More →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
