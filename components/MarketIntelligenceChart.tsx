'use client';

import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { MarketIntelligenceDataPoint } from '@/app/actions/marketIntelligenceActions';

// ─── Line colors matching the spec ───────────────────────────────
const COLORS = {
  mdlGovBondAvg: '#10B981', // Emerald - Hero Line
  mdlDepositAvg: '#6366F1', // Indigo - Deposits
  inflation: '#F43F5E', // Rose - Danger Line
  baseRate: '#F59E0B', // Amber - Benchmark
} as const;

const LINE_CONFIG = [
  {
    key: 'mdlGovBondAvg' as const,
    label: 'MDL Gov. Bonds Avg.',
    color: COLORS.mdlGovBondAvg,
    strokeWidth: 3,
    strokeDasharray: undefined as string | undefined,
    description: 'Average interest rate of your MDL government bonds',
  },
  {
    key: 'mdlDepositAvg' as const,
    label: 'MDL Deposits Avg.',
    color: COLORS.mdlDepositAvg,
    strokeWidth: 2.5,
    strokeDasharray: undefined as string | undefined,
    description: 'Average interest rate of your MDL bank deposits',
  },
  {
    key: 'inflation' as const,
    label: 'Inflation (Annual)',
    color: COLORS.inflation,
    strokeWidth: 2,
    strokeDasharray: '8 4',
    description: 'Annual inflation rate from BNM',
  },
  {
    key: 'baseRate' as const,
    label: 'BNM Base Rate',
    color: COLORS.baseRate,
    strokeWidth: 2,
    strokeDasharray: '3 3',
    description: 'National Bank of Moldova base interest rate',
  },
];

type LineKey = (typeof LINE_CONFIG)[number]['key'];

interface MarketIntelligenceChartProps {
  data: MarketIntelligenceDataPoint[];
}

// ─── Custom Tooltip ──────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  // Format the date label nicely
  let formattedLabel = label;
  try {
    formattedLabel = format(parseISO(label), 'MMMM yyyy');
  } catch {
    formattedLabel = label;
  }

  // Find inflation and gov bond values for "real rate" calculation
  let inflationVal: number | null = null;
  let govBondVal: number | null = null;
  let depositVal: number | null = null;

  payload.forEach((p: any) => {
    if (p.dataKey === 'inflation') inflationVal = p.value;
    if (p.dataKey === 'mdlGovBondAvg') govBondVal = p.value;
    if (p.dataKey === 'mdlDepositAvg') depositVal = p.value;
  });

  return (
    <div className='rounded-xl border border-slate-700/60 bg-slate-900/95 backdrop-blur-sm px-4 py-3 shadow-2xl'>
      <p className='text-xs font-semibold text-slate-300 mb-2 border-b border-slate-700/50 pb-2'>
        {formattedLabel}
      </p>
      <div className='space-y-1.5'>
        {payload.map((p: any) => {
          const config = LINE_CONFIG.find((c) => c.key === p.dataKey);
          if (!config) return null;
          return (
            <div
              key={p.dataKey}
              className='flex items-center justify-between gap-6'
            >
              <div className='flex items-center gap-2'>
                <span
                  className='inline-block h-2.5 w-2.5 rounded-full'
                  style={{ backgroundColor: config.color }}
                />
                <span className='text-xs text-slate-400'>{config.label}</span>
              </div>
              <span
                className='text-sm font-mono font-semibold'
                style={{ color: config.color }}
              >
                {p.value != null ? `${p.value.toFixed(2)}%` : '—'}
              </span>
            </div>
          );
        })}

        {/* Real Rate calculation */}
        {inflationVal != null && (govBondVal != null || depositVal != null) && (
          <div className='border-t border-slate-700/50 pt-2 mt-2 space-y-1'>
            {govBondVal != null && (
              <div className='flex items-center justify-between gap-6'>
                <span className='text-xs text-slate-500'>
                  Real Rate (Bonds)
                </span>
                <span
                  className={`text-sm font-mono font-bold ${
                    govBondVal - inflationVal >= 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {(govBondVal - inflationVal).toFixed(2)}%
                </span>
              </div>
            )}
            {depositVal != null && (
              <div className='flex items-center justify-between gap-6'>
                <span className='text-xs text-slate-500'>
                  Real Rate (Deposits)
                </span>
                <span
                  className={`text-sm font-mono font-bold ${
                    depositVal - inflationVal >= 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {(depositVal - inflationVal).toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Smart X-Axis Date Formatting ────────────────────────────────
function formatXAxisTick(dateStr: string, dataLength: number): string {
  try {
    const date = parseISO(dateStr);
    if (dataLength > 120) {
      // 10+ years: show only years
      return format(date, 'yyyy');
    } else if (dataLength > 48) {
      // 4+ years: show quarters
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Q${quarter} ${format(date, 'yy')}`;
    } else if (dataLength > 24) {
      // 2+ years
      return format(date, "MMM ''yy");
    }
    return format(date, 'MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function MarketIntelligenceChart({
  data,
}: MarketIntelligenceChartProps) {
  const [visibleLines, setVisibleLines] = React.useState<Set<LineKey>>(
    new Set(LINE_CONFIG.map((l) => l.key)),
  );

  const toggleLine = (key: LineKey) => {
    setVisibleLines((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        // Don't allow hiding all lines
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Determine tick interval based on data length
  const tickInterval = React.useMemo(() => {
    if (data.length > 120) return 11; // ~yearly
    if (data.length > 48) return 5; // ~half-yearly
    if (data.length > 24) return 2; // ~quarterly
    return 0; // show all
  }, [data.length]);

  if (data.length === 0) {
    return (
      <Card className='rounded-xl bg-[#0F172A] border-slate-800'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-white'>
            <TrendingUp className='h-5 w-5 text-emerald-400' />
            Market Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-slate-400 text-sm'>
            No market data available. Run the seed script to load historical
            data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='rounded-xl bg-[#0F172A] border-slate-800 overflow-hidden'>
      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2 text-white text-xl'>
              <TrendingUp className='h-5 w-5 text-emerald-400' />
              Market Intelligence
            </CardTitle>
            <CardDescription className='text-slate-400 mt-1'>
              Your MDL portfolio performance vs. National Bank benchmarks
            </CardDescription>
          </div>
        </div>

        {/* ─── Interactive Legend ──────────────────────────── */}
        <div className='flex flex-wrap gap-2 mt-4'>
          {LINE_CONFIG.map((line) => {
            const isVisible = visibleLines.has(line.key);
            return (
              <button
                key={line.key}
                onClick={() => toggleLine(line.key)}
                className={`
                  inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                  border transition-all duration-200 cursor-pointer
                  ${
                    isVisible
                      ? 'border-slate-600 bg-slate-800/80 text-white hover:bg-slate-700/80'
                      : 'border-slate-700/50 bg-slate-900/50 text-slate-500 hover:bg-slate-800/50'
                  }
                `}
                title={line.description}
              >
                <span
                  className='h-2.5 w-2.5 rounded-full transition-opacity'
                  style={{
                    backgroundColor: line.color,
                    opacity: isVisible ? 1 : 0.3,
                  }}
                />
                <span>{line.label}</span>
                {isVisible ? (
                  <Eye className='h-3 w-3 text-slate-400' />
                ) : (
                  <EyeOff className='h-3 w-3 text-slate-600' />
                )}
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className='pt-2'>
        <div className='h-[400px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={data}
              margin={{ top: 10, right: 16, left: 0, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                vertical={false}
                stroke='rgba(148, 163, 184, 0.08)'
              />

              <XAxis
                dataKey='date'
                stroke='#64748B'
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.15)' }}
                interval={tickInterval}
                tickFormatter={(val) => formatXAxisTick(val, data.length)}
                angle={-45}
                textAnchor='end'
                height={60}
              />

              <YAxis
                stroke='#64748B'
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}%`}
                domain={['auto', 'auto']}
              />

              {/* Zero reference line */}
              <ReferenceLine y={0} stroke='rgba(148, 163, 184, 0.2)' />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: 'rgba(148, 163, 184, 0.2)',
                  strokeDasharray: '3 3',
                }}
              />

              {LINE_CONFIG.map((line) => (
                <Line
                  key={line.key}
                  type='monotone'
                  dataKey={line.key}
                  name={line.label}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth}
                  strokeDasharray={line.strokeDasharray}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: line.color,
                    stroke: '#0F172A',
                    strokeWidth: 2,
                  }}
                  connectNulls
                  hide={!visibleLines.has(line.key)}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ─── Footnote ───────────────────────────────────── */}
        <p className='text-[11px] text-slate-600 mt-3 text-right'>
          Source: National Bank of Moldova (bnm.md) &bull; Updated weekly
        </p>
      </CardContent>
    </Card>
  );
}
