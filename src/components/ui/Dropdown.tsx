import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function Dropdown({ value, options, onChange, placeholder, className = '' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          flex min-w-0 items-center gap-2 w-full rounded-xl px-4 py-2.5 text-sm font-medium
          bg-white border border-[#006446]/14 text-left
          transition-all duration-150
          hover:border-[#006446]/25 hover:bg-[#006446]/[0.03]
          focus:outline-none focus:ring-2 focus:ring-[#006446]/20 focus:border-transparent
          ${open ? 'ring-2 ring-[#006446]/20 border-transparent' : ''}
        `}
      >
        {selected?.icon && <span className="flex-shrink-0">{selected.icon}</span>}
        <span className={`min-w-0 flex-1 truncate ${selected ? 'text-slate-900' : 'text-slate-400'}`}>
          {selected?.label || placeholder || 'Select...'}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#006446] flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full min-w-[180px] max-h-64 overflow-auto rounded-2xl border border-[#006446]/14 bg-white py-1 shadow-[0_24px_70px_-38px_rgba(0,100,70,0.45)] animate-in">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`
                  w-full min-w-0 flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left transition-colors
                  ${isSelected ? 'bg-[#006446]/10 text-[#006446]' : 'text-slate-700 hover:bg-[#006446]/[0.05] hover:text-[#006446]'}
                `}
              >
                {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#006446] flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
