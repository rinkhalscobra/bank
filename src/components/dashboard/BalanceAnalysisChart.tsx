import { useState } from 'react';
import { PieChart, Activity } from 'lucide-react';
import type { FiatBalance } from '../../hooks/useFiatBalances';
import type { CryptoBalance } from '../../hooks/useCryptoBalances';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../i18n/balance-analysis/translations';

interface Props {
  fiatBalances: FiatBalance[];
  cryptoBalances?: CryptoBalance[];
  showBalances: boolean;
}

const APPROX_USD_RATES: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  CAD: 0.74,
  CHF: 1.12,
};

const FIAT_COLORS: Record<string, string> = {
  USD: '#2563eb',
  EUR: '#16a34a',
  CAD: '#d97706',
  CHF: '#dc2626',
};

const APPROX_CRYPTO_USD: Record<string, number> = {
  BTC: 62000,
  ETH: 3400,
  SOL: 145,
  USDT: 1,
  USDC: 1,
};

const CRYPTO_COLORS: Record<string, string> = {
  BTC: '#f97316',
  ETH: '#4f46e5',
  SOL: '#9333ea',
  USDT: '#16a34a',
  USDC: '#0ea5e9',
};

const UI_COLORS = {
  panelBorder: '#dbe4ee',
  headerBorder: '#e2e8f0',
  softSurface: '#eef4ff',
  softSurfaceAlt: '#eefaf1',
  warmSurface: '#f8f1ff',
  accent: '#334155',
  accentMuted: '#64748b',
  filterBg: '#f1f5f9',
  filterText: '#64748b',
  barTrack: '#dbe5f0',
  waveStroke: '#475569',
  hiddenRing: '#d7e0ea',
  hiddenText: '#64748b',
  tooltip: '#1e293b',
};

function formatUsd(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatCompact(amount: number) {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${amount.toFixed(0)}`;
}

function DonutChart({
  segments,
  size = 200,
  centerTotalLabel,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  centerTotalLabel: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const strokeWidth = size * 0.14;
  const circumference = 2 * Math.PI * radius;

  let accumulated = 0;
  const arcs = segments.map((seg, i) => {
    const pct = seg.value / total;
    const dashLength = pct * circumference;
    const dashOffset = -accumulated * circumference + circumference * 0.25;
    accumulated += pct;
    return { ...seg, pct, dashLength, dashOffset, index: i };
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((arc) => (
          <circle
            key={arc.label}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={hoveredIndex === arc.index ? strokeWidth + 4 : strokeWidth}
            strokeDasharray={`${arc.dashLength} ${circumference - arc.dashLength}`}
            strokeDashoffset={arc.dashOffset}
            className="transition-all duration-200 cursor-pointer"
            style={{ opacity: hoveredIndex !== null && hoveredIndex !== arc.index ? 0.4 : 1 }}
            onMouseEnter={() => setHoveredIndex(arc.index)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {hoveredIndex !== null ? (
          <>
            <span className="text-xs" style={{ color: UI_COLORS.accentMuted }}>{arcs[hoveredIndex].label}</span>
            <span className="text-lg font-bold text-slate-900">{(arcs[hoveredIndex].pct * 100).toFixed(1)}%</span>
          </>
        ) : (
          <>
            <span className="text-xs" style={{ color: UI_COLORS.accentMuted }}>{centerTotalLabel}</span>
            <span className="text-lg font-bold text-slate-900">{formatUsd(total)}</span>
          </>
        )}
      </div>
    </div>
  );
}

function HorizontalBarChart({
  items,
  showBalances,
}: {
  items: { label: string; value: number; color: string; displayValue: string }[];
  showBalances: boolean;
}) {
  const maxValue = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const pct = (item.value / maxValue) * 100;
        return (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
              <span className="text-sm font-semibold text-slate-900">
                {showBalances ? item.displayValue : '****'}
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: UI_COLORS.barTrack }}>
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: showBalances ? `${pct}%` : '0%', backgroundColor: item.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ColumnItem {
  label: string;
  shortLabel: string;
  value: number;
  color: string;
  displayValue: string;
}

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  const d = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const tension = 0.35;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    d.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
  }
  return d.join(' ');
}

function WaveGraph({ items, showBalances }: { items: ColumnItem[]; showBalances: boolean }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxValue = Math.max(...items.map((i) => i.value), 1) * 1.12;
  const padding = { top: 36, right: 24, bottom: 50, left: 60 };
  const chartWidth = 600;
  const chartHeight = 300;
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const gridLines = 5;
  const step = maxValue / gridLines;
  const yTicks = Array.from({ length: gridLines + 1 }, (_, i) => i * step);

  const baseline = padding.top + plotHeight;

  const points = items.map((item, i) => {
    const x =
      items.length === 1
        ? padding.left + plotWidth / 2
        : padding.left + (i / (items.length - 1)) * plotWidth;
    const y = showBalances
      ? padding.top + plotHeight - (item.value / maxValue) * plotHeight
      : baseline;
    return { x, y, ...item };
  });

  const curvePath = smoothPath(points);
  const areaPath =
    points.length >= 2
      ? `${curvePath} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`
      : '';

  const gradientId = 'waveAreaGrad';

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto"
        style={{ minWidth: 400, maxHeight: 300 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={UI_COLORS.waveStroke} stopOpacity="0.26" />
            <stop offset="60%" stopColor={UI_COLORS.waveStroke} stopOpacity="0.08" />
            <stop offset="100%" stopColor={UI_COLORS.waveStroke} stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const y = padding.top + plotHeight - (tick / maxValue) * plotHeight;
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray={tick === 0 ? 'none' : '3 6'}
              />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" className="text-[10px]" fill="#94a3b8">
                {showBalances ? formatCompact(tick) : ''}
              </text>
            </g>
          );
        })}

        {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} className="transition-all duration-500" />}
        {curvePath && (
          <path
            d={curvePath}
            fill="none"
            stroke={UI_COLORS.waveStroke}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-500"
          />
        )}

        {points.map((p, i) => {
          const isHovered = hoveredIndex === i;

          return (
            <g
              key={p.label}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              {isHovered && showBalances && (
                <line
                  x1={p.x}
                  y1={p.y}
                  x2={p.x}
                  y2={baseline}
                  stroke={UI_COLORS.waveStroke}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  opacity={0.5}
                />
              )}

              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 8 : 5}
                fill="white"
                stroke={p.color}
                strokeWidth={isHovered ? 3 : 2.5}
                className="transition-all duration-200"
              />
              {isHovered && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={14}
                  fill={p.color}
                  opacity={0.12}
                  className="transition-all duration-200"
                />
              )}

              <circle cx={p.x} cy={p.y} r={22} fill="transparent" />

              {isHovered && showBalances && (
                <g>
                  <rect x={p.x - 48} y={p.y - 40} width={96} height={26} rx={6} fill={UI_COLORS.tooltip} />
                  <polygon
                    points={`${p.x - 5} ${p.y - 14}, ${p.x + 5} ${p.y - 14}, ${p.x} ${p.y - 9}`}
                    fill={UI_COLORS.tooltip}
                  />
                  <text
                    x={p.x}
                    y={p.y - 23}
                    textAnchor="middle"
                    fill="white"
                    className="text-[11px] font-medium"
                  >
                    {p.displayValue}
                  </text>
                </g>
              )}

              <text
                x={p.x}
                y={baseline + 18}
                textAnchor="middle"
                fill={isHovered ? UI_COLORS.accent : '#64748b'}
                className={`text-[10px] ${isHovered ? 'font-semibold' : 'font-medium'}`}
              >
                {p.shortLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

type ViewMode = 'donut' | 'bar';
type DataFilter = 'all' | 'fiat' | 'crypto';

export default function BalanceAnalysisChart({
  fiatBalances,
  cryptoBalances = [],
  showBalances,
}: Props) {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('donut');
  const [dataFilter, setDataFilter] = useState<DataFilter>('all');

  const DATA_FILTER_OPTIONS: { key: DataFilter; label: string }[] = [
    { key: 'all', label: t('balanceAnalysis.filters.all') },
    { key: 'fiat', label: t('balanceAnalysis.filters.fiat') },
    { key: 'crypto', label: t('balanceAnalysis.filters.crypto') },
  ];

  const CURRENCY_NAMES: Record<string, string> = {
    USD: t('balanceAnalysis.currencies.usd'),
    EUR: t('balanceAnalysis.currencies.eur'),
    CAD: t('balanceAnalysis.currencies.cad'),
    CHF: t('balanceAnalysis.currencies.chf'),
  };

  const fiatUsdValues = fiatBalances.map((fb) => ({
    label: fb.currency,
    value: fb.balance * (APPROX_USD_RATES[fb.currency] || 1),
    color: FIAT_COLORS[fb.currency] || '#64748b',
  }));

  const cryptoUsdValues = cryptoBalances
    .filter((c) => c.balance > 0)
    .map((c) => ({
      label: c.symbol,
      value: c.balance * (APPROX_CRYPTO_USD[c.symbol] || 1),
      color: CRYPTO_COLORS[c.symbol] || '#94a3b8',
    }));

  const filteredDonutSegments =
    dataFilter === 'fiat'
      ? fiatUsdValues
      : dataFilter === 'crypto'
      ? cryptoUsdValues
      : [...fiatUsdValues, ...cryptoUsdValues];

  const fiatBarItems = fiatBalances.map((fb) => ({
    label: `${fb.name.trim() || CURRENCY_NAMES[fb.currency] || fb.currency} (${fb.currency})`,
    shortLabel: fb.currency,
    value: fb.balance * (APPROX_USD_RATES[fb.currency] || 1),
    color: FIAT_COLORS[fb.currency] || '#64748b',
    displayValue: new Intl.NumberFormat(
      fb.currency === 'EUR' ? 'de-DE' : fb.currency === 'CAD' ? 'en-CA' : 'en-US',
      { style: 'currency', currency: fb.currency }
    ).format(fb.balance),
  }));

  const cryptoBarItems = cryptoBalances
    .filter((c) => c.balance > 0)
    .map((c) => ({
      label: `${c.name} (${c.symbol})`,
      shortLabel: c.symbol,
      value: c.balance * (APPROX_CRYPTO_USD[c.symbol] || 1),
      color: CRYPTO_COLORS[c.symbol] || '#94a3b8',
      displayValue: `${c.balance.toLocaleString('en-US', { maximumFractionDigits: 4 })} ${c.symbol}`,
    }));

  const filteredBarItems =
    dataFilter === 'fiat'
      ? fiatBarItems
      : dataFilter === 'crypto'
      ? cryptoBarItems
      : [...fiatBarItems, ...cryptoBarItems];

  const viewModes: { key: ViewMode; icon: typeof PieChart; tip: string }[] = [
    { key: 'donut', icon: PieChart, tip: t('balanceAnalysis.viewModes.donut') },
    { key: 'bar', icon: Activity, tip: t('balanceAnalysis.viewModes.wave') },
  ];

  const hiddenPlaceholder = (size: number) => (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <div
        className="flex items-center justify-center rounded-full border-[28px]"
        style={{ width: size * 0.8, height: size * 0.8, borderColor: UI_COLORS.hiddenRing }}
      >
        <span className="text-sm" style={{ color: UI_COLORS.hiddenText }}>{t('balanceAnalysis.hidden')}</span>
      </div>
    </div>
  );

  return (
    <div className="border bg-white shadow-[0_24px_60px_-48px_rgba(15,23,42,0.22)]" style={{ borderColor: UI_COLORS.panelBorder }}>
      <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: UI_COLORS.headerBorder }}>
        <h2 className="font-semibold text-slate-900">{t('balanceAnalysis.title')}</h2>

        <div className="flex items-center gap-3">
          <div className="flex gap-0.5 rounded-lg p-0.5" style={{ backgroundColor: UI_COLORS.filterBg }}>
            {DATA_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setDataFilter(opt.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  dataFilter === opt.key
                    ? 'bg-white shadow-sm'
                    : ''
                }`}
                style={{ color: dataFilter === opt.key ? UI_COLORS.accent : UI_COLORS.filterText }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="h-5 w-px" style={{ backgroundColor: UI_COLORS.headerBorder }} />

          <div className="flex gap-0.5 rounded-lg p-0.5" style={{ backgroundColor: UI_COLORS.filterBg }}>
            {viewModes.map((vm) => {
              const Icon = vm.icon;
              return (
                <button
                  key={vm.key}
                  onClick={() => setViewMode(vm.key)}
                  title={vm.tip}
                  className={`p-1.5 rounded-md transition-all duration-200 ${
                    viewMode === vm.key
                      ? 'bg-white shadow-sm'
                      : ''
                  }`}
                  style={{ color: viewMode === vm.key ? UI_COLORS.accent : UI_COLORS.filterText }}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-6">
        {viewMode === 'donut' && (
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              {showBalances ? (
                <DonutChart
                  segments={filteredDonutSegments}
                  size={220}
                  centerTotalLabel={t('balanceAnalysis.summary.totalUsd')}
                />
              ) : (
                hiddenPlaceholder(220)
              )}
            </div>

            <div className="flex-1 w-full space-y-5">
              <HorizontalBarChart items={filteredBarItems} showBalances={showBalances} />
            </div>
          </div>
        )}

        {viewMode === 'bar' && (
          <div className="space-y-4">
            <WaveGraph items={filteredBarItems} showBalances={showBalances} />

            <div className="flex flex-wrap gap-x-5 gap-y-1 justify-center pt-2">
              {filteredBarItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs" style={{ color: UI_COLORS.accentMuted }}>{item.shortLabel}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
