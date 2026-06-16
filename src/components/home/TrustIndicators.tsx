const awards = [
  { src: 'https://home.online-mgcb.com/1.png', alt: 'Award 1' },
  { src: 'https://home.online-mgcb.com/2.webp', alt: 'Award 2' },
  { src: 'https://home.online-mgcb.com/3.svg', alt: 'Award 3' },
  { src: 'https://home.online-mgcb.com/4.svg', alt: 'Award 4' },
];

export default function TrustIndicators() {
  return (
    <section className="relative border-b border-[#006446]/10 bg-gradient-to-b from-white to-[#006446]/[0.04] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <p className="text-xs font-semibold text-[#006446] tracking-[0.2em] uppercase whitespace-nowrap flex-shrink-0">
            Trusted by industry leaders
          </p>
          <div className="w-px h-8 bg-[#006446]/10 hidden md:block flex-shrink-0" />
          <div className="flex items-center justify-between gap-12 w-full overflow-x-auto">
            {awards.map((img) => (
              <div key={img.alt} className="flex items-center justify-center flex-shrink-0">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-20 w-auto object-contain grayscale-[20%] opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
