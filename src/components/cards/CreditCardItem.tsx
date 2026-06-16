import { CheckCircle, ArrowRight } from 'lucide-react';

const cardImages = {
  platinum: {
    src: 'https://caribbean.mastercard.com/content/dam/public/mastercardcom/lac/en-region-car/personal/find-a-card/platinum-credit-card/platinum-credit-card-1280x720.jpg',
    alt: 'Platinum Mastercard credit card',
    className: 'object-cover scale-[1.35]',
  },
  gold: {
    src: 'https://gallery.yopriceville.com/var/resizes/Free-Clipart-Pictures/Money.PNG/Gold_Bank_Card_PNG_Clipart.png?m=1629832502',
    alt: 'Gold bank card',
    className: 'object-contain',
  },
  business: {
    src: 'https://media.chase.com/content/dam/chase/media-center/pr/ink-biz-prem-card-vsb.png',
    alt: 'Business Premier credit card',
    className: 'object-contain',
  },
};

export default function CreditCardItem({
  t,
  variant,
  popular
}: {
  t: (k: string) => string;
  variant: 'platinum' | 'gold' | 'business';
  popular?: boolean;
}) {
  const benefits = [1, 2, 3, 4].map(i => t(`cards.${variant}.benefit${i}`));

  const checkColor = 'text-[#006446]';
  const image = cardImages[variant];

  return (
    <div
      className={`group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 ${
        popular
          ? 'border-2 border-[#006446] shadow-lg shadow-[#006446]/10'
          : 'border border-[#006446]/12 hover:border-[#006446]/25'
      }`}
    >
      {popular && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#006446]" />
      )}

      <div
        className={`relative px-6 pt-6 pb-4 ${
          popular ? 'bg-[#006446]/[0.08]' : 'bg-[#006446]/[0.04]'
        }`}
      >
        <div className="mx-auto flex aspect-[1.586/1] w-full max-w-[420px] items-center justify-center overflow-hidden rounded-2xl">
          <img
            src={image.src}
            alt={image.alt}
            className={`h-full w-full ${image.className}`}
          />
        </div>
      </div>

      <div className="p-7">
        <h3 className="text-xl font-display font-bold text-surface-900 mb-1">
          {t(`cards.${variant}.name`)}
        </h3>

        <div className="text-[#006446] font-medium text-sm mb-6">
          {t(`cards.${variant}.intro`)}
        </div>

        <div className="border-t border-[#006446]/10 pt-6 space-y-3 mb-8">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle
                className={`w-4 h-4 ${checkColor} mt-0.5 flex-shrink-0`}
              />
              <span className="text-surface-600 text-sm leading-relaxed">
                {b}
              </span>
            </div>
          ))}

          <div className="flex items-start gap-3">
            <CheckCircle
              className={`w-4 h-4 ${checkColor} mt-0.5 flex-shrink-0`}
            />
            <span className="text-surface-800 font-semibold text-sm">
              {t(`cards.${variant}.fee`)}
            </span>
          </div>
        </div>

        <button
          className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-semibold text-sm tracking-wide transition-all duration-200 ${
            popular
              ? 'bg-[#006446] text-white hover:bg-[#00523a]'
              : 'bg-[#006446]/10 text-[#006446] hover:bg-[#006446]/15'
          }`}
        >
          {t(`cards.${variant}.apply`)}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
