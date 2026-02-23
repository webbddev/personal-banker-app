'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Briefcase, 
  ArrowRightLeft,
  Coins
} from 'lucide-react';
import { 
  formatAmount, 
  convertCurrency, 
  ExchangeRates,
  SupportedCurrencyCode 
} from '@/utils/currency-formatter';
import { CurrencyTotals } from '@/utils/investment-calculations';

interface PortfolioSummaryCardProps {
  totalCapitalMDL: number;
  capitalBreakdown: CurrencyTotals;
  monthlyRevenueMDL: number;
  monthlyReturnsBreakdown: CurrencyTotals;
  exchangeRates: ExchangeRates;
}

export function PortfolioSummaryCard({
  totalCapitalMDL,
  capitalBreakdown,
  monthlyRevenueMDL,
  monthlyReturnsBreakdown,
  exchangeRates
}: PortfolioSummaryCardProps) {
  
  const getEquivalents = (mdlAmount: number) => {
    return [
      { code: 'EUR' as SupportedCurrencyCode, value: convertCurrency(mdlAmount, 'MDL', 'EUR', exchangeRates) },
      { code: 'GBP' as SupportedCurrencyCode, value: convertCurrency(mdlAmount, 'MDL', 'GBP', exchangeRates) },
      { code: 'USD' as SupportedCurrencyCode, value: convertCurrency(mdlAmount, 'MDL', 'USD', exchangeRates) },
    ];
  };

  const revenueEquivalents = getEquivalents(monthlyRevenueMDL);
  const capitalEquivalents = getEquivalents(totalCapitalMDL);

  // Filter out currencies with 0 returns for cleaner look
  const activeReturns = Object.entries(monthlyReturnsBreakdown)
    .filter(([_, amount]) => amount > 0)
    .map(([code, amount]) => ({ code: code as SupportedCurrencyCode, amount }));

  // Filter out currencies with 0 capital for cleaner look
  const activeCapital = Object.entries(capitalBreakdown)
    .filter(([_, amount]) => amount > 0)
    .map(([code, amount]) => ({ code: code as SupportedCurrencyCode, amount }));

  return (
    <Card className="h-full border-primary/20 shadow-md bg-gradient-to-br from-card to-muted/30 transition-all hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-primary" />
          Current Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        {/* Monthly Revenue Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Monthly Revenue</span>
              <span className="text-xl font-bold text-green-600">
                {formatAmount(monthlyRevenueMDL, 'MDL')}
              </span>
            </div>
            <TrendingUp className="w-8 h-8 opacity-10 text-green-600" />
          </div>
          
          <div className="pt-1 space-y-1">
            {activeReturns.map((ret) => (
              <div key={ret.code} className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Returns in {ret.code}</span>
                <span className="text-green-600/80 font-medium">
                  + {formatAmount(ret.amount, ret.code)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="pt-2 border-t border-border/50">
            <span className="text-[9px] uppercase tracking-tighter text-muted-foreground flex items-center gap-1 mb-2">
              <ArrowRightLeft className="w-2.5 h-2.5" />
              Equivalents
            </span>
            <div className="grid grid-cols-1 gap-1">
              {revenueEquivalents.map((eq) => (
                <div key={eq.code} className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">{eq.code}</span>
                  <span className="font-medium">{formatAmount(eq.value, eq.code)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Investment Totals Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Investments</span>
              <span className="text-xl font-bold text-primary">
                {formatAmount(totalCapitalMDL, 'MDL')}
              </span>
            </div>
            <Coins className="w-8 h-8 opacity-10 text-primary" />
          </div>

          <div className="pt-1 space-y-1">
            {activeCapital.map((cap) => (
              <div key={cap.code} className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Total in {cap.code}</span>
                <span className="text-primary/80 font-medium">
                  {formatAmount(cap.amount, cap.code)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="pt-2 border-t border-border/50">
            <span className="text-[9px] uppercase tracking-tighter text-muted-foreground flex items-center gap-1 mb-2">
              <ArrowRightLeft className="w-2.5 h-2.5" />
              Equivalents
            </span>
            <div className="grid grid-cols-1 gap-1">
              {capitalEquivalents.map((eq) => (
                <div key={eq.code} className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">{eq.code}</span>
                  <span className="font-medium">{formatAmount(eq.value, eq.code)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
