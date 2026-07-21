import { useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import type { AssetSeries } from '../../hooks/useBalanceHistory';
import { useLanguage, type Language } from '../../contexts/LanguageContext';
import '../../i18n/balancehistorychart/translations';

interface Props {
  assetSeries: AssetSeries[];
}

const ASSET_COLORS: Record<string, string> = {
  USD: '#006446',
  EUR: '#0d7a58',
  CAD: '#1e8c69',
  CHF: '#b91c1c',
  BTC: '#2f9e7a',
  ETH: '#41b18b',
  SOL: '#56c39c',
  USDC: '#6ed2ac',
  USDT: '#86dfbc',
};

const CURRENCY_LOCALE_MAP: Record<Language, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  it: 'it-IT',
  el: 'el-GR',
};

const DATE_LOCALE_MAP: Record<Language, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  it: 'it-IT',
  el: 'el-GR',
};

const SUPPORTED_FIAT_CURRENCIES = new Set(['USD', 'EUR', 'CAD', 'CHF']);

function interpolate(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}

function formatBalance(amount: number, symbol: string, language: Language) {
  const locale = CURRENCY_LOCALE_MAP[language];

  if (SUPPORTED_FIAT_CURRENCIES.has(symbol)) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: symbol,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  if (amount >= 1000) {
    return `${amount.toLocaleString(locale, { maximumFractionDigits: 2 })} ${symbol}`;
  }

  return `${amount.toLocaleString(locale, { maximumFractionDigits: 6 })} ${symbol}`;
}

function formatCompactBalance(amount: number, symbol: string, language: Language) {
  const locale = CURRENCY_LOCALE_MAP[language];

  if (SUPPORTED_FIAT_CURRENCIES.has(symbol)) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: symbol,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  }

  if (amount >= 1000) return `${amount.toLocaleString(locale, { maximumFractionDigits: 1 })} ${symbol}`;
  if (amount >= 1) return `${amount.toLocaleString(locale, { maximumFractionDigits: 2 })} ${symbol}`;
  return `${amount.toLocaleString(locale, { maximumFractionDigits: 4 })} ${symbol}`;
}

function formatPercent(value: number, language: Language) {
  const locale = CURRENCY_LOCALE_MAP[language];
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDateLabel(dateStr: string, allDates: string[], language: Language) {
  const locale = DATE_LOCALE_MAP[language];
  const d = new Date(dateStr);
  const uniqueDays = new Set(allDates.map((s) => s.slice(0, 10)));

  if (uniqueDays.size <= 1) {
    return d.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
  }

  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
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

function getStrokeColor(symbol: string) {
  return ASSET_COLORS[symbol] || '#006446';
}

function getGradientStops(symbol: string) {
  const hex = ASSET_COLORS[symbol] || '#006446';
  return { stop1: `${hex}40`, stop2: `${hex}00` };
}

export default function BalanceHistoryChart({ assetSeries }: Props) {
  const { language, t } = useLanguage();

  const fiatAssets = assetSeries.filter((a) => a.assetType === 'fiat');
  const cryptoAssets = assetSeries.filter((a) => a.assetType === 'crypto');
  const allSymbols = [...fiatAssets, ...cryptoAssets];

  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    allSymbols.length > 0 ? allSymbols[0].symbol : ''
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeSeries = assetSeries.find((a) => a.symbol === selectedSymbol);
  const data = activeSeries?.points ?? [];
  const allDates = data.map((d) => d.date);
  const stroke = getStrokeColor(selectedSymbol);
  const grad = getGradientStops(selectedSymbol);

  const latestVal = data.length > 0 ? data[data.length - 1].balance : 0;
  const firstVal = data.length > 0 ? data[0].balance : 0;
  const changeAmount = latestVal - firstVal;
  const changePct = firstVal > 0 ? (changeAmount / firstVal) * 100 : 0;

  const padding = { top: 36, right: 24, bottom: 50, left: 72 };
  const chartWidth = 700;
  const chartHeight = 300;
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const values = data.map((d) => d.balance);
  const maxVal = values.length > 0 ? Math.max(...values) * 1.1 : 1;
  const minVal = values.length > 0 ? Math.min(...values, 0) : 0;
  const range = maxVal - minVal || 1;
  const baseline = padding.top + plotHeight;

  const gridLines = 5;
  const step = range / gridLines;
  const yTicks = Array.from({ length: gridLines + 1 }, (_, i) => minVal + i * step);

  const points = data.map((d, i) => {
    const x =
      data.length === 1
        ? padding.left + plotWidth / 2
        : padding.left + (i / (data.length - 1)) * plotWidth;
    const y = padding.top + plotHeight - ((d.balance - minVal) / range) * plotHeight;
    return { x, y, ...d };
  });

  const curvePath = smoothPath(points);
  const areaPath =
    points.length >= 2
      ? `${curvePath} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`
      : '';

  const changeBadgeText = useMemo(() => {
    const amountText = formatBalance(changeAmount, selectedSymbol, language);
    const percentText = formatPercent(changePct, language);

    return changeAmount >= 0
      ? interpolate(t('balanceHistoryChart.change.positive'), {
          amount: amountText,
          percent: percentText,
        })
      : interpolate(t('balanceHistoryChart.change.negative'), {
          amount: amountText,
          percent: percentText,
        });
  }, [changeAmount, changePct, selectedSymbol, language, t]);

  if (allSymbols.length === 0) {
    return (
      <div className="rounded-2xl border border-[#006446]/14 bg-white p-10 text-center shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
        <TrendingUp className="mx-auto mb-3 h-10 w-10 text-[#006446]/30" />
        <h3 className="mb-1 font-semibold text-slate-800">
          {t('balanceHistoryChart.empty.title')}
        </h3>
        <p className="text-sm text-[#006446]/70">
          {t('balanceHistoryChart.empty.description')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="flex flex-col gap-3 border-b border-[#006446]/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">
            {t('balanceHistoryChart.title')}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-lg font-bold text-slate-900">
              {formatBalance(latestVal, selectedSymbol, language)}
            </span>

            {data.length > 1 && (
              <span
                className="rounded-full border border-[#006446]/14 bg-[#006446]/10 px-2 py-0.5 text-xs font-semibold text-[#006446]"
              >
                {changeBadgeText}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {fiatAssets.length > 0 && (
            <div className="flex gap-0.5 rounded-lg bg-[#006446]/[0.05] p-0.5">
              {fiatAssets.map((a) => (
                <button
                  key={a.symbol}
                  onClick={() => setSelectedSymbol(a.symbol)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                    selectedSymbol === a.symbol
                      ? 'bg-white text-[#006446] shadow-sm'
                      : 'text-[#006446]/70 hover:text-[#006446]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getStrokeColor(a.symbol) }}
                    />
                    {a.symbol}
                  </span>
                </button>
              ))}
            </div>
          )}

          {cryptoAssets.length > 0 && (
            <div className="flex gap-0.5 rounded-lg bg-[#006446]/[0.05] p-0.5">
              {cryptoAssets.map((a) => (
                <button
                  key={a.symbol}
                  onClick={() => setSelectedSymbol(a.symbol)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                    selectedSymbol === a.symbol
                      ? 'bg-white text-[#006446] shadow-sm'
                      : 'text-[#006446]/70 hover:text-[#006446]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getStrokeColor(a.symbol) }}
                    />
                    {a.symbol}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {data.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#006446]/70">
            {interpolate(t('balanceHistoryChart.noHistoryFor'), {
              symbol: selectedSymbol,
            })}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto"
              style={{ minWidth: 400, maxHeight: 320 }}
            >
              <defs>
                <linearGradient id="balHistGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={grad.stop1} />
                  <stop offset="100%" stopColor={grad.stop2} />
                </linearGradient>
              </defs>

              {yTicks.map((tick, i) => {
                const y = padding.top + plotHeight - ((tick - minVal) / range) * plotHeight;

                return (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray={i === 0 ? 'none' : '3 6'}
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[10px]"
                      fill="#94a3b8"
                    >
                      {formatCompactBalance(tick, selectedSymbol, language)}
                    </text>
                  </g>
                );
              })}

              {areaPath && (
                <path
                  d={areaPath}
                  fill="url(#balHistGrad)"
                  className="transition-all duration-500"
                />
              )}

              {curvePath && (
                <path
                  d={curvePath}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-500"
                />
              )}

              {points.map((p, i) => {
                const isHovered = hoveredIndex === i;
                const showLabel =
                  data.length <= 15 ||
                  i === 0 ||
                  i === data.length - 1 ||
                  i % Math.ceil(data.length / 8) === 0;

                return (
                  <g
                    key={i}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="cursor-pointer"
                  >
                    {isHovered && (
                      <line
                        x1={p.x}
                        y1={p.y}
                        x2={p.x}
                        y2={baseline}
                        stroke={stroke}
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        opacity={0.5}
                      />
                    )}

                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 7 : 4}
                      fill="white"
                      stroke={stroke}
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all duration-200"
                    />

                    {isHovered && (
                      <circle cx={p.x} cy={p.y} r={13} fill={stroke} opacity={0.12} />
                    )}

                    <circle cx={p.x} cy={p.y} r={20} fill="transparent" />

                    {isHovered && (
                      <g>
                        <rect
                          x={p.x - 60}
                          y={p.y - 42}
                          width={120}
                          height={28}
                          rx={6}
                          fill="#1e293b"
                        />
                        <polygon
                          points={`${p.x - 5} ${p.y - 14}, ${p.x + 5} ${p.y - 14}, ${p.x} ${p.y - 9}`}
                          fill="#1e293b"
                        />
                        <text
                          x={p.x}
                          y={p.y - 24}
                          textAnchor="middle"
                          fill="white"
                          className="text-[11px] font-medium"
                        >
                          {formatBalance(p.balance, selectedSymbol, language)}
                        </text>
                      </g>
                    )}

                    {showLabel && (
                      <text
                        x={p.x}
                        y={baseline + 18}
                        textAnchor="middle"
                        fill={isHovered ? stroke : '#64748b'}
                        className={`text-[10px] ${isHovered ? 'font-semibold' : 'font-medium'}`}
                      >
                        {formatDateLabel(p.date, allDates, language)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
