'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Settings2,
  TrendingUp,
  Coins,
  ArrowRight,
  Info,
  Banknote,
  Percent,
  Calendar,
  Zap,
  Plus,
  Minus,
} from 'lucide-react';
import { SimulationParams } from '@/utils/simulator-calculations';
import {
  convertCurrency,
  ExchangeRates,
  SupportedCurrencyCode,
} from '@/utils/currency-formatter';

interface SimulatorSidebarProps {
  params: SimulationParams;
  setParams: (params: SimulationParams) => void;
  isSyncEnabled: boolean;
  setIsSyncEnabled: (enabled: boolean) => void;
  dbCapital: number;
  currentMonthlyReturns: number;
  displayCurrency: SupportedCurrencyCode;
  setDisplayCurrency: (currency: SupportedCurrencyCode) => void;
  exchangeRates: ExchangeRates;
}

export function SimulatorSidebar({
  params,
  setParams,
  isSyncEnabled,
  setIsSyncEnabled,
  dbCapital,
  currentMonthlyReturns,
  displayCurrency,
  setDisplayCurrency,
  exchangeRates,
}: SimulatorSidebarProps) {
  const [isIncomeSyncEnabled, setIsIncomeSyncEnabled] = useState(true);

  const handleChange = (key: keyof SimulationParams, displayValue: number) => {
    // Convert the value entered in displayCurrency BACK to MDL for internal storage
    const mdlValue = convertCurrency(
      displayValue,
      displayCurrency,
      'MDL',
      exchangeRates
    );
    setParams({ ...params, [key]: mdlValue });
  };

  const handleSyncToggle = (checked: boolean) => {
    setIsSyncEnabled(checked);
    if (checked) {
      setParams({ ...params, startingCapital: dbCapital });
    }
  };

  const handleIncomeSyncToggle = (checked: boolean) => {
    setIsIncomeSyncEnabled(checked);
    if (checked) {
      setParams({ ...params, monthlyIncome: currentMonthlyReturns });
    }
  };

  // Helper to convert internal MDL to display currency for the input field
  const toDisplay = (mdlValue: number) => {
    return Number(
      convertCurrency(mdlValue, 'MDL', displayCurrency, exchangeRates).toFixed(
        2
      )
    );
  };

  return (
    <Card className='h-full border-primary/20 shadow-md transition-all duration-300 hover:shadow-lg'>
      <CardHeader className='pb-4'>
        <CardTitle className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Settings2 className='w-5 h-5 text-primary' />
            <span className='text-lg'>Parameters</span>
          </div>
          <Tabs
            value={displayCurrency}
            onValueChange={(v) => setDisplayCurrency(v as SupportedCurrencyCode)}
          >
            <TabsList className='h-8 bg-muted/50'>
              <TabsTrigger value='MDL' className='text-[10px] px-2'>
                MDL
              </TabsTrigger>
              <TabsTrigger value='USD' className='text-[10px] px-2'>
                USD
              </TabsTrigger>
              <TabsTrigger value='EUR' className='text-[10px] px-2'>
                EUR
              </TabsTrigger>
              <TabsTrigger value='GBP' className='text-[10px] px-2'>
                GBP
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Starting Capital */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='startingCapital' className='flex items-center gap-2'>
              <Banknote className='w-3.5 h-3.5 text-muted-foreground' />
              Starting Capital
            </Label>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='sync-db'
                checked={isSyncEnabled}
                onCheckedChange={handleSyncToggle}
              />
              <Label
                htmlFor='sync-db'
                className='text-xs text-muted-foreground cursor-pointer flex items-center gap-1 font-normal'
              >
                <Zap className='w-3 h-3' />
                Sync
              </Label>
            </div>
          </div>
          <Input
            id='startingCapital'
            type='number'
            disabled={isSyncEnabled}
            className='focus-visible:ring-primary/30'
            value={toDisplay(params.startingCapital)}
            onChange={(e) =>
              handleChange('startingCapital', parseFloat(e.target.value) || 0)
            }
          />
        </div>

        {/* Monthly Income */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='monthlyIncome' className='flex items-center gap-2'>
              <Coins className='w-3.5 h-3.5 text-muted-foreground' />
              Monthly Income
            </Label>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='sync-income'
                checked={isIncomeSyncEnabled}
                onCheckedChange={handleIncomeSyncToggle}
              />
              <Label
                htmlFor='sync-income'
                className='text-xs text-muted-foreground cursor-pointer flex items-center gap-1 font-normal'
              >
                <Zap className='w-3 h-3' />
                Sync
              </Label>
            </div>
          </div>
          <Input
            id='monthlyIncome'
            type='number'
            disabled={isIncomeSyncEnabled}
            className='focus-visible:ring-primary/30'
            value={toDisplay(params.monthlyIncome)}
            onChange={(e) =>
              handleChange('monthlyIncome', parseFloat(e.target.value) || 0)
            }
          />
        </div>

        {/* Monthly Expenses */}
        <div className='space-y-2'>
          <Label htmlFor='monthlyExpenses' className="flex items-center gap-2 text-rose-500/80">
            <TrendingUp className="w-3.5 h-3.5 rotate-180" />
            Monthly Expenses
          </Label>
          <Input
            id='monthlyExpenses'
            type='number'
            className="focus-visible:ring-rose-200"
            value={toDisplay(params.monthlyExpenses)}
            onChange={(e) =>
              handleChange('monthlyExpenses', parseFloat(e.target.value) || 0)
            }
          />
        </div>

        <div className="h-px bg-border my-2" />

        {/* Annual Return Rate */}
        <div className='space-y-3'>
          <div className='flex justify-between items-center'>
            <Label htmlFor='annualReturnRate' className="flex items-center gap-2">
              <Percent className="w-3.5 h-3.5 text-muted-foreground" />
              Yearly Return
            </Label>
            <span className='text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full'>
              {params.annualReturnRate}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 shrink-0 md:hidden"
              onClick={() => setParams({ ...params, annualReturnRate: Math.max(0, Number((params.annualReturnRate - 0.1).toFixed(1))) })}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <input
              id='annualReturnRate'
              type='range'
              min='0'
              max='30'
              step='0.1'
              className='w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary'
              value={params.annualReturnRate}
              onChange={(e) =>
                setParams({
                  ...params,
                  annualReturnRate: parseFloat(e.target.value),
                })
              }
            />
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 shrink-0 md:hidden"
              onClick={() => setParams({ ...params, annualReturnRate: Math.min(30, Number((params.annualReturnRate + 0.1).toFixed(1))) })}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Inflation Rate */}
        <div className='space-y-3'>
          <div className='flex justify-between items-center'>
            <Label htmlFor='inflationRate' className="flex items-center gap-2">
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              Inflation
            </Label>
            <span className='text-xs font-bold px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full'>
              {params.inflationRate}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 shrink-0 md:hidden"
              onClick={() => setParams({ ...params, inflationRate: Math.max(0, Number((params.inflationRate - 0.1).toFixed(1))) })}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <input
              id='inflationRate'
              type='range'
              min='0'
              max='20'
              step='0.1'
              className='w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-orange-500'
              value={params.inflationRate}
              onChange={(e) =>
                setParams({ ...params, inflationRate: parseFloat(e.target.value) })
              }
            />
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 shrink-0 md:hidden"
              onClick={() => setParams({ ...params, inflationRate: Math.min(20, Number((params.inflationRate + 0.1).toFixed(1))) })}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Years */}
        <div className='space-y-3'>
          <div className='flex justify-between items-center'>
            <Label htmlFor='years' className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              Horizon
            </Label>
            <span className='text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full'>
              {params.years} Yrs
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 shrink-0 md:hidden"
              onClick={() => setParams({ ...params, years: Math.max(1, params.years - 1) })}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <input
              id='years'
              type='range'
              min='1'
              max='50'
              step='1'
              className='w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-blue-500'
              value={params.years}
              onChange={(e) => setParams({ ...params, years: parseInt(e.target.value) })}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 shrink-0 md:hidden"
              onClick={() => setParams({ ...params, years: Math.min(50, params.years + 1) })}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
