import { TreePine, GraduationCap, Home, Heart } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const initiativeIcons = [Home, GraduationCap, TreePine, Heart];
const initiativeKeys = ['i1', 'i2', 'i3', 'i4'] as const;

export default function CommunityImpact() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-gradient-to-b from-white via-emerald-50/45 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[#006446] font-semibold tracking-widest text-sm uppercase">
              {t('about.community.badge')}
            </span>
            <h2 className="text-4xl font-display font-bold text-surface-900 mt-3 mb-6">
              {t('about.community.title')}
            </h2>
            <p className="text-lg text-surface-500 leading-relaxed mb-10">
              {t('about.community.desc')}
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {initiativeKeys.map((key, index) => {
                const Icon = initiativeIcons[index];
                return (
                  <div key={key} className="bg-white rounded-2xl p-6 border border-[#006446]/12 shadow-soft hover:shadow-soft-lg hover:border-[#006446]/25 transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-xl bg-[#006446]/10 border border-[#006446]/15 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300">
                      <Icon className="w-5 h-5 text-[#006446]" />
                    </div>
                    <div className="text-2xl font-bold text-[#006446] mb-1">{t(`about.community.${key}.stat`)}</div>
                    <h3 className="font-semibold text-surface-900 mb-2">{t(`about.community.${key}.title`)}</h3>
                    <p className="text-sm text-surface-500 leading-relaxed">{t(`about.community.${key}.desc`)}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Community volunteer event"
              className="w-full h-[560px] object-cover rounded-2xl shadow-soft"
            />
            <div className="absolute -bottom-6 -left-6 bg-[#006446] text-white p-6 rounded-2xl shadow-soft-lg max-w-[220px]">
              <div className="text-3xl font-bold mb-1">{t('about.community.floatStat')}</div>
              <p className="text-sm text-emerald-50/85">{t('about.community.floatDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
