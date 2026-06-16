import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Send,
  User,
  LogOut,
  ChevronRight,
  CreditCard,
  Zap,
  Landmark,
  ArrowRightLeft,
  Banknote,
  PieChart,
  FileText,
  ChevronLeft,
  X,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, languages } from '../../contexts/LanguageContext';
import '../../i18n/dashboard-layout/translations';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const isCrmAdmin = location.pathname.startsWith('/crm-admin');

  const [moreOpen, setMoreOpen] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const navSections = [
    {
      label: t('dashboardLayout.sections.banking'),
      items: [
        { path: '/dashboard', label: t('dashboardLayout.nav.overview'), icon: LayoutDashboard },
        { path: '/dashboard/cards', label: t('dashboardLayout.nav.cards'), icon: CreditCard },
        { path: '/dashboard/transactions', label: t('dashboardLayout.nav.transactions'), icon: Receipt },
        { path: '/dashboard/transfers', label: t('dashboardLayout.nav.transfers'), icon: Send },
        { path: '/dashboard/taxes', label: t('dashboardLayout.nav.taxes'), icon: FileText },
        { path: '/dashboard/bill-pay', label: t('dashboardLayout.nav.billPay'), icon: Zap },
      ],
    },
    {
      label: t('dashboardLayout.sections.wealth'),
      items: [
        { path: '/dashboard/fixed-deposits', label: t('dashboardLayout.nav.addFund'), icon: Landmark },
        { path: '/dashboard/loans', label: t('dashboardLayout.nav.loans'), icon: Banknote },
        { path: '/dashboard/currency-exchange', label: t('dashboardLayout.nav.fx'), icon: ArrowRightLeft },
        { path: '/dashboard/analytics', label: t('dashboardLayout.nav.analytics'), icon: PieChart },
      ],
    },
  ];

  const currentLang = languages.find((l) => l.code === language)!;
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  const isActive = (path: string) =>
    path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(path);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#006446]/[0.04]">
      {!isCrmAdmin && (
        <div className="z-30 shrink-0 bg-gradient-to-r from-[#00523a] via-[#006446] to-[#0a7f59] shadow-[0_18px_45px_-38px_rgba(0,100,70,0.45)]">
          <header className="flex min-h-[72px] items-center gap-4 px-4 sm:px-6">
            <div className="relative flex min-w-0 flex-1 self-stretch">
              {canScrollLeft && (
                <button
                  onClick={() => scroll('left')}
                  className="absolute left-0 z-10 h-full px-1.5 bg-gradient-to-r from-[#00523a] via-[#006446] to-transparent text-white/70 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}

              <div
                ref={scrollRef}
                className="h-full min-w-0 flex-1 overflow-x-auto scrollbar-hide"
              >
                <div className="mx-auto flex h-full w-max items-stretch">
                  {navSections.map((section) => (
                    <div key={section.label} className="flex h-full shrink-0 items-stretch">
                      {section.items.map((item) => {
                        const active = isActive(item.path);
                        return (
                          <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`relative flex h-full shrink-0 flex-col items-center justify-center gap-0.5 px-3 py-2.5 text-[10px] font-medium transition-all duration-200 sm:px-4 sm:text-xs ${
                              active
                                ? 'bg-white/10 text-white'
                                : 'text-white hover:bg-white/8'
                            }`}
                          >
                            {active && (
                              <span className="absolute inset-x-2 top-0 h-0.5 rounded-b bg-white" />
                            )}
                            <item.icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                            <span className="truncate max-w-[56px] sm:max-w-none">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}

                  <button
                    onClick={() => navigate('/dashboard/profile')}
                    className={`relative flex h-full shrink-0 flex-col items-center justify-center gap-0.5 px-3 py-2.5 text-[10px] font-medium transition-all duration-200 sm:px-4 sm:text-xs ${
                      isActive('/dashboard/profile')
                        ? 'bg-white/10 text-white'
                        : 'text-white hover:bg-white/8'
                    }`}
                  >
                    {isActive('/dashboard/profile') && (
                      <span className="absolute inset-x-2 top-0 h-0.5 rounded-b bg-white" />
                    )}
                    <User className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                    <span>{t('dashboardLayout.nav.profile')}</span>
                  </button>
                </div>
              </div>

              {canScrollRight && (
                <button
                  onClick={() => scroll('right')}
                  className="absolute right-0 z-10 h-full px-1.5 bg-gradient-to-l from-[#0a7f59] via-[#006446] to-transparent text-white/70 hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div ref={langRef} className="relative">
                <button
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-white transition-all duration-200 hover:border-white/30 hover:bg-white/10"
                  title={t('dashboardLayout.header.language')}
                >
                  <Globe className="h-4 w-4" />
                  <img src={currentLang.flag} alt="" className="h-3.5 w-5 rounded-sm object-cover" />
                  <span className="hidden text-sm font-medium sm:inline">{currentLang.code.toUpperCase()}</span>
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${showLangDropdown ? 'rotate-180' : ''}`}
                  />
                </button>

                {showLangDropdown && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-[#006446]/12 bg-white shadow-[0_24px_70px_-38px_rgba(0,100,70,0.45)]">
                    <div className="p-2">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setShowLangDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                            language === lang.code
                              ? 'bg-[#006446]/10 text-[#006446] font-semibold'
                              : 'text-slate-700 hover:bg-[#006446]/[0.05] hover:text-[#006446]'
                          }`}
                        >
                          <img
                            src={lang.flag}
                            alt=""
                            className="h-4 w-6 rounded-sm border border-[#006446]/12 object-cover"
                          />
                          <span>{lang.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-sm text-white transition-colors hover:text-white/80"
                title={t('dashboardLayout.header.signOut')}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t('dashboardLayout.header.signOut')}</span>
              </button>
            </div>
          </header>
        </div>
      )}

      <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {children}
      </main>

      {moreOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="absolute bottom-0 inset-x-0 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-gradient-to-br from-[#00523a] via-[#006446] to-[#0a7f59] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">{t('dashboardLayout.mobile.navigation')}</h3>
              <button
                onClick={() => setMoreOpen(false)}
                className="text-white/70 transition-colors hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {navSections.map((section) => (
              <div key={section.label} className="mb-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/45">
                  {section.label}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {section.items.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMoreOpen(false)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                          active
                            ? 'bg-white/12 text-white'
                            : 'text-white/75 hover:bg-white/8 hover:text-white'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
