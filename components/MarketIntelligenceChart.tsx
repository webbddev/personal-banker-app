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
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { MarketIntelligenceDataPoint } from '@/app/actions/marketIntelligenceActions';
import { cn } from '@/lib/utils';

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

  let formattedLabel = label;
  try {
    formattedLabel = format(parseISO(label), 'MMMM yyyy');
  } catch {
    formattedLabel = label;
  }

  let inflationVal: number | null = null;
  let govBondVal: number | null = null;
  let depositVal: number | null = null;

  payload.forEach((p: any) => {
    if (p.dataKey === 'inflation') inflationVal = p.value;
    if (p.dataKey === 'mdlGovBondAvg') govBondVal = p.value;
    if (p.dataKey === 'mdlDepositAvg') depositVal = p.value;
  });

  return (
    <div className='rounded-xl border border-border dark:border-slate-700/60 bg-card dark:bg-slate-900/95 backdrop-blur-sm px-4 py-3 shadow-2xl'>
      <p className='text-xs font-semibold text-muted-foreground mb-2 border-b border-border dark:border-slate-700/50 pb-2'>
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
                <span className='text-xs text-muted-foreground'>
                  {config.label}
                </span>
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
          <div className='border-t border-border dark:border-slate-700/50 pt-2 mt-2 space-y-1'>
            {govBondVal != null && (
              <div className='flex items-center justify-between gap-6'>
                <span className='text-xs text-muted-foreground/70'>
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
                <span className='text-xs text-muted-foreground/70'>
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
    if (dataLength > 120) return format(date, 'yyyy');
    if (dataLength > 48) {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Q${quarter} ${format(date, 'yy')}`;
    }
    if (dataLength > 24) return format(date, "MMM ''yy");
    return format(date, 'MMM yyyy');
  } catch {
    return dateStr;
  }
}

// ═══════════════════════════════════════════════════════════════════
// ─── Data Summary Table (shows selected month's data) ────────────
// ═══════════════════════════════════════════════════════════════════
function DataSummaryTable({
  point,
  dateLabel,
}: {
  point: MarketIntelligenceDataPoint;
  dateLabel: string;
}) {
  const govBondVal = point.mdlGovBondAvg;
  const depositVal = point.mdlDepositAvg;
  const inflationVal = point.inflation;
  const baseRateVal = point.baseRate;

  const realRateBonds =
    govBondVal != null && inflationVal != null
      ? govBondVal - inflationVal
      : null;
  const realRateDeposits =
    depositVal != null && inflationVal != null
      ? depositVal - inflationVal
      : null;

  const mainMetrics = [
    {
      label: 'MDL Gov. Bonds Avg.',
      value: govBondVal,
      color: COLORS.mdlGovBondAvg,
      isInvestment: true,
    },
    {
      label: 'MDL Deposits Avg.',
      value: depositVal,
      color: COLORS.mdlDepositAvg,
      isInvestment: true,
    },
    {
      label: 'Inflation (Annual)',
      value: inflationVal,
      color: COLORS.inflation,
      isInvestment: false,
    },
    {
      label: 'BNM Base Rate',
      value: baseRateVal,
      color: COLORS.baseRate,
      isInvestment: false,
    },
  ];

  const realRateMetrics = [
    { label: 'Real Rate (Bonds)', value: realRateBonds },
    { label: 'Real Rate (Deposits)', value: realRateDeposits },
  ];

  return (
    <div className='w-full'>
      {/* Period label */}
      <p className='text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-[0.2em] flex items-center gap-2'>
        <span className='h-1px flex-1 bg-border dark:bg-slate-800' />
        {dateLabel}
        <span className='h-1px flex-1 bg-border dark:bg-slate-800' />
      </p>

      {/* Responsive grid: Full width on all devices */}
      <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4'>
        {/* 4 main metrics */}
        {mainMetrics.map((m) => (
          <div
            key={m.label}
            className='flex flex-col items-start gap-2 rounded-xl border border-border bg-muted/20 dark:bg-slate-800/20 p-4 transition-all duration-300 hover:bg-muted/30 dark:hover:bg-slate-800/30'
          >
            <div className='flex items-center gap-2'>
              <span
                className='h-2.5 w-2.5 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.1)]'
                style={{ backgroundColor: m.color }}
              />
              <span className='text-[10px] sm:text-[11px] text-muted-foreground font-bold uppercase tracking-wider truncate'>
                {m.label}
              </span>
            </div>
            {m.value != null ? (
              <span
                className={cn('text-xl sm:text-2xl font-mono font-black')}
                style={{ color: m.color }}
              >
                {m.value.toFixed(2)}%
              </span>
            ) : (
              <div className='flex flex-col'>
                <span className='text-xl sm:text-2xl font-mono text-muted-foreground/30'>
                  —
                </span>
                <span className='text-[9px] text-muted-foreground/50 italic font-medium -mt-1 uppercase'>
                  No Data
                </span>
              </div>
            )}
          </div>
        ))}

        {/* 2 Real Rate pills */}
        {realRateMetrics.map((m) => (
          <div
            key={m.label}
            className='flex flex-col items-start gap-2 rounded-xl border border-border bg-muted/20 dark:bg-slate-800/20 p-4 transition-all duration-300 hover:bg-muted/30 dark:hover:bg-slate-800/30'
          >
            <span className='text-[10px] sm:text-[11px] text-muted-foreground font-bold uppercase tracking-wider'>
              {m.label}
            </span>
            {m.value != null ? (
              <div
                className={cn(
                  'inline-flex items-center px-4 py-1.5 rounded-full animate-pulse shadow-sm',
                  m.value >= 0
                    ? 'text-emerald-400 bg-emerald-400/10'
                    : 'text-rose-400 bg-rose-400/10',
                )}
              >
                <span className='text-xl sm:text-2xl font-mono font-black'>
                  {m.value >= 0 ? '+' : ''}
                  {m.value.toFixed(2)}%
                </span>
              </div>
            ) : (
              <div className='flex flex-col'>
                <span className='text-xl sm:text-2xl font-mono text-muted-foreground/30'>
                  —
                </span>
                <span className='text-[9px] text-muted-foreground/50 italic font-medium -mt-1 uppercase truncate w-full'>
                  Insufficient Data
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── Main Component ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
export function MarketIntelligenceChart({
  data,
}: MarketIntelligenceChartProps) {
  const [visibleLines, setVisibleLines] = React.useState<Set<LineKey>>(
    new Set(LINE_CONFIG.map((l) => l.key)),
  );

  const [activeIndex, setActiveIndex] = React.useState<number>(
    data.length > 0 ? data.length - 1 : 0,
  );

  const handleNext = () => {
    setActiveIndex((prev) => (prev >= data.length - 1 ? 0 : prev + 1));
  };

  const handleBack = () => {
    setActiveIndex((prev) => (prev <= 0 ? data.length - 1 : prev - 1));
  };

  const toggleLine = (key: LineKey) => {
    setVisibleLines((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const tickInterval = React.useMemo(() => {
    if (data.length > 120) return 11;
    if (data.length > 48) return 5;
    if (data.length > 24) return 2;
    return 0;
  }, [data.length]);

  const selectedPoint = data[activeIndex] ?? data[data.length - 1];
  let selectedDateLabel = '';
  if (selectedPoint) {
    try {
      selectedDateLabel = format(parseISO(selectedPoint.date), 'MMMM yyyy');
    } catch {
      selectedDateLabel = selectedPoint.date;
    }
  }

  // ─── Keyboard Navigation ──────────────────────────────────────────
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only navigate if an input element is not focused
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        handleBack();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, data.length]); // Dependencies to ensure current handlers are used

  if (data.length === 0) {
    return (
      <Card className='h-full'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-xl'>
            <TrendingUp className='h-5 w-5 text-emerald-400' />
            Market Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>
            No market data available. Run the seed script to load historical
            data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='h-full overflow-hidden border-none shadow-none bg-transparent'>
      <CardHeader className='px-0 pb-6'>
        <div className='flex items-start justify-between w-full'>
          <div>
            <CardTitle className='flex items-center gap-3 text-2xl lg:text-3xl font-black tracking-tight'>
              <div className='p-2 bg-emerald-500/10 rounded-lg'>
                <TrendingUp className='h-6 w-6 text-emerald-500' />
              </div>
              Market Intelligence
            </CardTitle>
            <CardDescription className='mt-2 text-sm sm:text-base font-medium text-muted-foreground'>
              MDL portfolio performance against National Bank of Moldova (BNM)
              benchmarks
            </CardDescription>
          </div>
        </div>

        {/* ─── Improved Interactive Legend ──────────────────── */}
        <div className='flex flex-wrap gap-2.5 mt-6'>
          {LINE_CONFIG.map((line) => {
            const isVisible = visibleLines.has(line.key);
            return (
              <button
                key={line.key}
                onClick={() => toggleLine(line.key)}
                className={cn(
                  'group flex items-center gap-3 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-300',
                  isVisible
                    ? 'border-border bg-card dark:bg-slate-900 shadow-sm text-foreground'
                    : 'border-border/40 bg-muted/10 text-muted-foreground opacity-60 hover:opacity-100',
                )}
                title={line.description}
              >
                <div
                  className='h-3 w-3 rounded-full border-2 border-white/20'
                  style={{
                    backgroundColor: line.color,
                    boxShadow: isVisible ? `0 0 12px ${line.color}40` : 'none',
                  }}
                />
                <span>{line.label}</span>
                <div className='ml-1 opacity-40 group-hover:opacity-100 transition-opacity'>
                  {isVisible ? (
                    <Eye className='h-3.5 w-3.5' />
                  ) : (
                    <EyeOff className='h-3.5 w-3.5' />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className='px-0 pt-0'>
        <div className='flex flex-col gap-8'>
          {/* ─── Full Width Data Table ── */}
          <div className='w-full'>
            <DataSummaryTable
              point={selectedPoint}
              dateLabel={selectedDateLabel}
            />
          </div>

          {/* ─── Chart Area ─── */}
          <div className='w-full'>
            <div
              className='overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0'
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div className='min-w-[600px] sm:min-w-0 h-[350px] md:h-[400px] lg:h-[450px] 2xl:h-[600px] w-full relative'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart
                    data={data}
                    margin={{ top: 20, right: 20, left: -20, bottom: 20 }}
                    onClick={(props) => {
                      if (props.activeTooltipIndex !== undefined) {
                        setActiveIndex(props.activeTooltipIndex);
                      }
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray='4 4'
                      vertical={false}
                      stroke='rgba(148, 163, 184, 0.05)'
                    />

                    <XAxis
                      dataKey='date'
                      stroke='rgba(148, 163, 184, 0.3)'
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      interval={tickInterval}
                      tickFormatter={(val) => formatXAxisTick(val, data.length)}
                      angle={-45}
                      textAnchor='end'
                      height={60}
                      dy={10}
                    />

                    <YAxis
                      stroke='rgba(148, 163, 184, 0.3)'
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${val}%`}
                      domain={['auto', 'auto']}
                    />

                    {/* Vertical Tracker Line matching navigation */}
                    <ReferenceLine
                      x={selectedPoint?.date}
                      stroke='rgba(16, 185, 129, 0.3)'
                      strokeWidth={2}
                      strokeDasharray='5 5'
                      label={{
                        position: 'top',
                        value: 'Selected Period',
                        fill: 'rgba(16, 185, 129, 0.6)',
                        fontSize: 10,
                        fontWeight: 'bold',
                      }}
                    />

                    <ReferenceLine
                      y={0}
                      stroke='rgba(148, 163, 184, 0.15)'
                      strokeWidth={2}
                    />

                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{
                        stroke: 'rgba(16, 185, 129, 0.2)',
                        strokeWidth: 2,
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
                          r: 6,
                          fill: line.color,
                          stroke: 'white',
                          strokeWidth: 3,
                        }}
                        animationDuration={1000}
                        connectNulls
                        hide={!visibleLines.has(line.key)}
                      />
                    ))}

                    {/* Selected Point Markers */}
                    {LINE_CONFIG.map((line) => {
                      if (
                        !visibleLines.has(line.key) ||
                        selectedPoint[line.key] === null
                      )
                        return null;
                      return (
                        <ReferenceLine
                          key={`marker-${line.key}`}
                          x={selectedPoint.date}
                          y={selectedPoint[line.key] as number}
                          stroke='none'
                          label={{
                            position: 'center',
                            content: (
                              <circle
                                r={4}
                                fill={line.color}
                                stroke='white'
                                strokeWidth={2}
                                className='animate-bounce'
                              />
                            ),
                          }}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ─── High-Fidelity Navigation ── */}
        <div className='flex flex-col items-center gap-4 mt-12 mb-4'>
          <div className='flex items-center gap-8 bg-muted/20 dark:bg-slate-800/20 px-6 py-3 rounded-2xl border border-border shadow-sm'>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleBack}
              className='h-12 w-12 rounded-full hover:bg-emerald-500/10 hover:text-emerald-500 transition-all active:scale-90'
              aria-label='Previous month'
            >
              <ChevronLeft className='h-8 w-8' />
            </Button>

            <div className='flex flex-col items-center min-w-[120px]'>
              <span className='text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1'>
                Time Traveler
              </span>
              <div className='flex items-baseline gap-1'>
                <span className='text-2xl font-black text-emerald-500'>
                  {activeIndex + 1}
                </span>
                <span className='text-sm font-bold text-muted-foreground/40'>
                  / {data.length}
                </span>
              </div>
            </div>

            <Button
              variant='ghost'
              size='icon'
              onClick={handleNext}
              className='h-12 w-12 rounded-full hover:bg-emerald-500/10 hover:text-emerald-500 transition-all active:scale-90'
              aria-label='Next month'
            >
              <ChevronRight className='h-8 w-8' />
            </Button>
          </div>
          <p className='text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-40'>
            Use arrows or click the chart to step through historical performance
          </p>
        </div>
      </CardContent>

      <CardFooter className='px-0 pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40'>
        <div className='flex items-center gap-2'>
          <div className='h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping' />
          <p className='text-[11px] font-bold text-muted-foreground uppercase tracking-wider'>
            Live Market Updates: Synchronized
          </p>
        </div>
        <p className='text-[10px] text-muted-foreground font-medium'>
          © {new Date().getFullYear()} Personal Banker Intelligence &bull; Data
          provided by BNM.md
        </p>
      </CardFooter>
    </Card>
  );
}
