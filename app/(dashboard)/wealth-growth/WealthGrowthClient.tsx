'use client';

import { useState, useMemo } from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/site-header';
import { SimulatorSidebar } from '@/components/wealth-growth/SimulatorSidebar';
import { PortfolioSummaryCard } from '@/components/wealth-growth/PortfolioSummaryCard';
import { GrowthChart } from '@/components/wealth-growth/GrowthChart';
import { YearlyTable } from '@/components/wealth-growth/YearlyTable';
import {
  TrendingUp,
  Wallet,
  PiggyBank,
  Settings2,
  LineChart as LineChartIcon,
  Table as TableIcon,
} from 'lucide-react';
import {
  calculateProjection,
  SimulationParams,
} from '@/utils/simulator-calculations';
import {
  CurrencyTotals,
} from '@/utils/investment-calculations';
import {
  convertCurrency,
  formatAmount,
  SupportedCurrencyCode,
  ExchangeRates,
} from '@/utils/currency-formatter';

interface WealthGrowthClientProps {
  initialCapital: number;
  capitalBreakdown: CurrencyTotals;
  currentMonthlyReturns: number;
  monthlyReturnsBreakdown: CurrencyTotals;
  exchangeRates: ExchangeRates;
}

export default function WealthGrowthClient({
  initialCapital,
  capitalBreakdown,
  currentMonthlyReturns,
  monthlyReturnsBreakdown,
  exchangeRates,
}: WealthGrowthClientProps) {
  const [displayCurrency, setDisplayCurrency] =
    useState<SupportedCurrencyCode>('MDL');
  const [isSyncEnabled, setIsSyncEnabled] = useState(true);
  const [params, setParams] = useState<SimulationParams>({
    startingCapital: initialCapital,
    monthlyIncome: currentMonthlyReturns || 20000,
    monthlyExpenses: 15000,
    annualReturnRate: 8,
    inflationRate: 5,
    years: 20,
  });

  const projection = useMemo(() => calculateProjection(params), [params]);

  const finalPoint = projection[projection.length - 1];

  const formatValue = (val: number) => {
    const converted = convertCurrency(val, 'MDL', displayCurrency, exchangeRates);
    return formatAmount(converted, displayCurrency);
  };

  return (
    <SidebarInset className='w-full'>
      <SiteHeader title='Wealth Growth Simulator' />
      <div className='flex flex-1 flex-col p-4 lg:p-6 space-y-6'>
        {/* Top Section: Portfolio Summary & Parameters Side-by-Side on MD+ screens */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <PortfolioSummaryCard
            totalCapitalMDL={initialCapital}
            capitalBreakdown={capitalBreakdown}
            monthlyRevenueMDL={currentMonthlyReturns}
            monthlyReturnsBreakdown={monthlyReturnsBreakdown}
            exchangeRates={exchangeRates}
          />
          <SimulatorSidebar
            params={params}
            setParams={setParams}
            isSyncEnabled={isSyncEnabled}
            setIsSyncEnabled={setIsSyncEnabled}
            dbCapital={initialCapital}
            currentMonthlyReturns={currentMonthlyReturns}
            displayCurrency={displayCurrency}
            setDisplayCurrency={setDisplayCurrency}
            exchangeRates={exchangeRates}
          />
        </div>

        {/* Main Visuals Section */}
        <div className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='p-6 bg-card rounded-xl border shadow-sm relative overflow-hidden'>
              <Wallet className="absolute right-[-10px] top-[-10px] w-16 h-16 opacity-5 text-primary" />
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-primary" />
                <p className='text-sm text-muted-foreground'>
                  Projected Total (Nominal)
                </p>
              </div>
              <p className='text-2xl font-bold'>
                {formatValue(finalPoint.nominalTotal)}
              </p>
            </div>
            <div className='p-6 bg-card rounded-xl border shadow-sm relative overflow-hidden'>
               <PiggyBank className="absolute right-[-10px] top-[-10px] w-16 h-16 opacity-5 text-primary" />
               <div className="flex items-center gap-2 mb-1">
                <PiggyBank className="w-4 h-4 text-primary" />
                <p className='text-sm text-muted-foreground'>
                  Adjusted for Inflation
                </p>
              </div>
              <p className='text-2xl font-bold text-primary'>
                {formatValue(finalPoint.realTotal)}
              </p>
            </div>
            <div className='p-6 bg-card rounded-xl border shadow-sm relative overflow-hidden'>
              <TrendingUp className="absolute right-[-10px] top-[-10px] w-16 h-16 opacity-5 text-green-600" />
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <p className='text-sm text-muted-foreground'>
                  Final Monthly Passive Income
                </p>
              </div>
              <p className='text-2xl font-bold text-green-600'>
                {formatValue(finalPoint.passiveIncome)}
              </p>
            </div>
          </div>

          <div className='w-full'>
            <GrowthChart
              data={projection}
              displayCurrency={displayCurrency}
              exchangeRates={exchangeRates}
            />
          </div>

          <div className='w-full'>
            <YearlyTable
              data={projection}
              displayCurrency={displayCurrency}
              exchangeRates={exchangeRates}
            />
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
