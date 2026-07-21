import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({
    left: 0,
    top: 0,
    width: 180,
    maxHeight: 256,
  });

  const updateMenuPosition = useCallback(() => {
    const trigger = ref.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportMargin = 8;
    const menuGap = 6;
    const desiredHeight = 256;
    const spaceBelow = window.innerHeight - rect.bottom - viewportMargin - menuGap;
    const spaceAbove = rect.top - viewportMargin - menuGap;
    const openAbove = spaceBelow < Math.min(180, desiredHeight) && spaceAbove > spaceBelow;
    const availableHeight = Math.max(80, openAbove ? spaceAbove : spaceBelow);
    const maxHeight = Math.min(desiredHeight, availableHeight);
    const top = openAbove
      ? Math.max(viewportMargin, rect.top - menuGap - maxHeight)
      : Math.min(window.innerHeight - viewportMargin - maxHeight, rect.bottom + menuGap);

    setMenuPosition({
      left: Math.max(viewportMargin, Math.min(rect.left, window.innerWidth - viewportMargin - rect.width)),
      top,
      width: Math.max(180, Math.min(rect.width, window.innerWidth - viewportMargin * 2)),
      maxHeight,
    });
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open, options.length, updateMenuPosition]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
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

      {open && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          style={menuPosition}
          className="fixed z-[9999] overflow-auto rounded-2xl border border-[#006446]/14 bg-white py-1 shadow-[0_24px_70px_-38px_rgba(0,100,70,0.45)] animate-in"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
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
        </div>,
        document.body,
      )}
    </div>
  );
}
