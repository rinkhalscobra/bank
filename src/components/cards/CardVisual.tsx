import { Landmark, Wifi } from 'lucide-react';

const styles = {
  platinum: {
    bg: 'from-[#0a7a55] via-[#006446] to-[#004e38]',
    accent: 'text-white',
    chip: 'from-yellow-300 to-yellow-500',
  },
  gold: {
    bg: 'from-[#0a7a55] via-[#006446] to-[#004e38]',
    accent: 'text-white',
    chip: 'from-yellow-200 to-yellow-400',
  },
  business: {
    bg: 'from-[#0a7a55] via-[#006446] to-[#004e38]',
    accent: 'text-white',
    chip: 'from-yellow-300 to-yellow-500',
  },
};

export default function CardVisual({ variant, label }: { variant: 'platinum' | 'gold' | 'business'; label: string }) {
  const s = styles[variant];

  return (
    <div className="p-4">
      <div className={`relative w-[320px] aspect-[1.586/1] bg-gradient-to-br ${s.bg} rounded-2xl p-6 overflow-hidden hover:scale-[1.02] transition-transform duration-500`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.06] rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/[0.04] rounded-full translate-y-1/2 -translate-x-1/3" />
        <div className="relative h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <Landmark className="w-8 h-8 text-white/90" />
            <Wifi className={`w-5 h-5 ${s.accent} rotate-90`} />
          </div>
          <div className={`w-11 h-8 rounded-md bg-gradient-to-br ${s.chip}`} />
          <div>
            <div className="text-white/60 text-xs tracking-[0.25em] font-medium mb-1">{label}</div>
            <div className="flex justify-between items-end">
              <div className="text-white/80 text-sm tracking-[0.2em] font-mono">**** **** **** 4821</div>
              <div className="text-white/50 text-[10px] font-medium">VISA</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
