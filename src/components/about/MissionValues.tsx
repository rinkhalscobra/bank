import { Shield, Heart, Eye, Lightbulb, Handshake, Scale } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const valueIcons = [Shield, Heart, Eye, Lightbulb, Handshake, Scale];
const valueKeys = ['v1', 'v2', 'v3', 'v4', 'v5', 'v6'] as const;

export default function MissionValues() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-[#006446]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-white/80 font-semibold tracking-widest text-sm uppercase">
            {t('about.mission.badge')}
          </span>
          <h2 className="text-4xl font-display font-bold text-white mt-3 mb-6">
            {t('about.mission.title')}
          </h2>
          <p className="text-lg text-emerald-50/85 leading-relaxed">
            {t('about.mission.desc')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {valueKeys.map((key, index) => {
            const Icon = valueIcons[index];
            return (
              <div
                key={key}
                className="bg-white rounded-2xl p-8 border border-white/15 shadow-soft hover:shadow-soft-lg hover:border-white/30 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-[#006446]/10 border border-[#006446]/15 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-[#006446]" />
                </div>
                <h3 className="text-xl font-semibold text-surface-900 mb-3">{t(`about.mission.${key}.title`)}</h3>
                <p className="text-surface-500 leading-relaxed">{t(`about.mission.${key}.desc`)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
