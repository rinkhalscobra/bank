import { useLanguage } from '../../contexts/LanguageContext';

const logos = [
  { src: 'https://qonto.com/blog/images/asset/33614/image/xl_avif-5382e93d33dc4011a2737a0854c0ae07.avif', alt: 'Company rating' },
  { src: 'https://qonto.com/blog/images/asset/33616/image/4ee67c6c7bc288a3353c0481d98d4d51.svg', alt: 'Company rating' },
  { src: 'https://qonto.com/blog/images/asset/33618/image/xl_avif-8f5dffc280f4273860a7d9a963f520a1.avif', alt: 'Company rating' },
  { src: 'https://qonto.com/blog/images/asset/30367/image/2743033fb09af35034d0bcac494110d7.svg', alt: 'Company rating' },
  { src: 'https://qonto.com/blog/images/asset/30365/image/xl_avif-723fe9bac0d5f6d6d12c5f5644675ae8.avif', alt: 'Company rating' },
];

export default function BusinessRatings() {
  const { t } = useLanguage();

  return (
    <section className="relative border-b border-[#006446]/10 bg-gradient-to-b from-white to-[#006446]/[0.04] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="lg:w-1/3 shrink-0 text-center lg:text-left">
            <h3 className="text-3xl lg:text-4xl font-display font-bold text-surface-900 leading-tight">
              {t('biz.rated.title')}
            </h3>
            <div className="mt-4 w-16 h-1 bg-[#006446] rounded-full mx-auto lg:mx-0" />
          </div>

          <div className="lg:w-2/3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 items-center">
              {logos.map((logo, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center rounded-xl border border-transparent p-4 transition-all duration-300 hover:border-[#006446]/10 hover:bg-white hover:shadow-soft"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="max-h-16 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
