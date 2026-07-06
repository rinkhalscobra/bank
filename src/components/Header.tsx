import { ChevronDown, Globe, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useLanguage, languages } from '../contexts/LanguageContext';
import { useBranding } from '../contexts/BrandingContext';
import BrandLogo from './ui/BrandLogo';
import '../i18n/header/translations';

export default function Header() {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { branding } = useBranding();
  const [showPersonalDropdown, setShowPersonalDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const personalTimeoutRef = useRef<number | null>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const handlePersonalMouseEnter = () => {
    if (personalTimeoutRef.current) clearTimeout(personalTimeoutRef.current);
    setShowPersonalDropdown(true);
  };

  const handlePersonalMouseLeave = () => {
    personalTimeoutRef.current = window.setTimeout(() => {
      setShowPersonalDropdown(false);
    }, 300);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages.find((l) => l.code === language)!;

  if (location.pathname.startsWith('/crm-admin')) {
    return null;
  }

  const navLinkClasses =
    'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-surface-900 hover:text-surface-950 hover:bg-surface-900/5';

  const langButtonClasses =
    'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-surface-700 hover:text-surface-950 hover:bg-surface-900/5';

  const mobileToggleClasses =
    'lg:hidden p-2 rounded-lg transition-all text-surface-800 hover:text-surface-950 hover:bg-surface-900/5';

  const mobileMenuClasses =
    'lg:hidden backdrop-blur-xl animate-in bg-white/98 border-t border-surface-200';

  const mobileMenuLinkClasses =
    'block px-4 py-3 rounded-lg transition-all text-sm font-medium text-surface-800 hover:text-surface-950 hover:bg-surface-900/5';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-lg shadow-black/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center group">
            <BrandLogo
              src={branding.navbarLogoUrl}
              alt={branding.brandName}
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link to="/" className={navLinkClasses}>
              {t('home')}
            </Link>

            <div
              className="relative"
              onMouseEnter={handlePersonalMouseEnter}
              onMouseLeave={handlePersonalMouseLeave}
            >
              <button className={`${navLinkClasses} flex items-center gap-1`}>
                {t('personal')}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${showPersonalDropdown ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {showPersonalDropdown && (
                <div className="absolute top-full left-0 mt-2 w-60 bg-white rounded-xl shadow-soft-lg border border-surface-100 overflow-hidden animate-in">
                  <div className="p-2">
                    <Link
                      to="/cards"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-50 transition-colors group"
                    >
                      <span className="text-sm font-medium text-surface-700 group-hover:text-surface-900">
                        {t('cards')}
                      </span>
                    </Link>

                    <Link
                      to="/loans"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-50 transition-colors group"
                    >
                      <span className="text-sm font-medium text-surface-700 group-hover:text-surface-900">
                        {t('loans')}
                      </span>
                    </Link>

                    <Link
                      to="/investments"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-50 transition-colors group"
                    >
                      <span className="text-sm font-medium text-surface-700 group-hover:text-surface-900">
                        {t('investments')}
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link to="/business-banking" className={navLinkClasses}>
              {t('business')}
            </Link>
            <Link to="/international" className={navLinkClasses}>
              {t('international')}
            </Link>
            <Link to="/about" className={navLinkClasses}>
              {t('about')}
            </Link>
          </nav>

          {/* Language & Online Banking */}
          <div className="flex items-center gap-3">
            <div ref={langRef} className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className={langButtonClasses}
              >
                <Globe className="w-4 h-4" />
                <img
                  src={currentLang.flag}
                  alt=""
                  className="w-5 h-3.5 object-cover rounded-sm"
                />
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${showLangDropdown ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {showLangDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-soft-lg border border-surface-100 overflow-hidden animate-in">
                  <div className="p-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLangDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${language === lang.code
                            ? 'bg-[#006446]/10 text-[#006446] font-semibold'
                            : 'hover:bg-surface-50 text-surface-700'
                          }`}
                      >
                        <img
                          src={lang.flag}
                          alt=""
                          className="w-6 h-4 object-cover rounded-sm border border-surface-200"
                        />
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/online-banking"
              className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-[#006446] to-[#006e50] hover:from-[#00563b] hover:to-[#005f45] text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-[#006446]/20"
            >
              {t('onlineBanking')}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={mobileToggleClasses}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={mobileMenuClasses}>
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileMenuLinkClasses}
            >
              {t('home')}
            </Link>
            <Link
              to="/cards"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileMenuLinkClasses}
            >
              {t('cards')}
            </Link>
            <Link
              to="/loans"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileMenuLinkClasses}
            >
              {t('loans')}
            </Link>
            <Link
              to="/investments"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileMenuLinkClasses}
            >
              {t('investments')}
            </Link>
            <Link
              to="/business-banking"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileMenuLinkClasses}
            >
              {t('business')}
            </Link>
            <Link
              to="/international"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileMenuLinkClasses}
            >
              {t('international')}
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileMenuLinkClasses}
            >
              {t('about')}
            </Link>
            <div className="pt-2">
              <Link
                to="/online-banking"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-gradient-to-r from-brand-500 to-brand-600 text-white px-6 py-3 rounded-xl font-medium text-sm"
              >
                {t('onlineBanking')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
