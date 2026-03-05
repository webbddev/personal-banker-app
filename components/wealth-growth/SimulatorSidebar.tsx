'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
      exchangeRates,
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
        2,
      ),
    );
  };

  return (
    <Card className='h-full border-primary/20 shadow-md transition-all duration-300 hover:shadow-lg'>
      <CardHeader className='pb-4'>
        <CardTitle className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Settings2 className='w-5 h-5 text-primary' />
            <span className='text-lg'>Simulator</span>
          </div>
          <Tabs
            value={displayCurrency}
            onValueChange={(v) =>
              setDisplayCurrency(v as SupportedCurrencyCode)
            }
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

      <Tabs defaultValue='general' className='w-full'>
        <div className='px-6'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='general'>General</TabsTrigger>
            <TabsTrigger value='events'>Events</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className='space-y-6 pt-6'>
          <TabsContent value='general' className='space-y-6 mt-0'>
            {/* Starting Capital */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label
                  htmlFor='startingCapital'
                  className='flex items-center gap-2'
                >
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
                  handleChange(
                    'startingCapital',
                    parseFloat(e.target.value) || 0,
                  )
                }
              />
            </div>

            {/* Monthly Income */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label
                  htmlFor='monthlyIncome'
                  className='flex items-center gap-2'
                >
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
              <Label
                htmlFor='monthlyExpenses'
                className='flex items-center gap-2 text-rose-500/80'
              >
                <TrendingUp className='w-3.5 h-3.5 rotate-180' />
                Monthly Expenses
              </Label>
              <Input
                id='monthlyExpenses'
                type='number'
                className='focus-visible:ring-rose-200'
                value={toDisplay(params.monthlyExpenses)}
                onChange={(e) =>
                  handleChange(
                    'monthlyExpenses',
                    parseFloat(e.target.value) || 0,
                  )
                }
              />
            </div>

            {/* Income Growth Rate */}
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <Label
                  htmlFor='incomeGrowthRate'
                  className='flex items-center gap-2 text-green-600/80'
                >
                  <TrendingUp className='w-3.5 h-3.5' />
                  Annual Income Growth
                </Label>
                <span className='text-xs font-bold px-2 py-0.5 bg-green-100 text-green-600 rounded-full'>
                  {params.incomeGrowthRate}%
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <input
                  id='incomeGrowthRate'
                  type='range'
                  min='0'
                  max='15'
                  step='0.5'
                  className='w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-green-500'
                  value={params.incomeGrowthRate}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      incomeGrowthRate: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className='h-px bg-border my-2' />

            {/* Annual Return Rate */}
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <Label
                  htmlFor='annualReturnRate'
                  className='flex items-center gap-2'
                >
                  <Percent className='w-3.5 h-3.5 text-muted-foreground' />
                  Yearly Return
                </Label>
                <span className='text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full'>
                  {params.annualReturnRate}%
                </span>
              </div>
              <div className='flex items-center gap-2'>
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
              </div>
            </div>

            {/* Tax Rate */}
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <Label htmlFor='taxRate' className='flex items-center gap-2'>
                  <Percent className='w-3.5 h-3.5 text-red-500' />
                  Tax on Returns
                </Label>
                <span className='text-xs font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded-full'>
                  {params.taxRate}%
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <input
                  id='taxRate'
                  type='range'
                  min='0'
                  max='40'
                  step='1'
                  className='w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-red-500'
                  value={params.taxRate}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      taxRate: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            {/* Inflation Rate */}
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <Label
                  htmlFor='inflationRate'
                  className='flex items-center gap-2'
                >
                  <ArrowRight className='w-3.5 h-3.5 text-muted-foreground' />
                  Inflation
                </Label>
                <span className='text-xs font-bold px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full'>
                  {params.inflationRate}%
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <input
                  id='inflationRate'
                  type='range'
                  min='0'
                  max='20'
                  step='0.1'
                  className='w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-orange-500'
                  value={params.inflationRate}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      inflationRate: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            {/* Years */}
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <Label htmlFor='years' className='flex items-center gap-2'>
                  <Calendar className='w-3.5 h-3.5 text-muted-foreground' />
                  Horizon
                </Label>
                <span className='text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full'>
                  {params.years} Yrs
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <input
                  id='years'
                  type='range'
                  min='1'
                  max='50'
                  step='1'
                  className='w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-blue-500'
                  value={params.years}
                  onChange={(e) =>
                    setParams({ ...params, years: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value='events' className='space-y-6 mt-0'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Label className='text-sm font-semibold'>One-time Events</Label>
                <Button
                  size='sm'
                  variant='outline'
                  className='h-8 gap-1 text-xs'
                  onClick={() => {
                    const id = Math.random().toString(36).substring(2, 9);
                    setParams({
                      ...params,
                      oneTimeEvents: [
                        ...params.oneTimeEvents,
                        { id, description: 'New Event', amount: 0, year: 1 },
                      ],
                    });
                  }}
                >
                  <Plus className='w-3.5 h-3.5' />
                  Add Event
                </Button>
              </div>

              {params.oneTimeEvents.length === 0 ? (
                <div className='text-center py-8 px-4 border border-dashed rounded-lg bg-muted/30'>
                  <Info className='w-8 h-8 text-muted-foreground/50 mx-auto mb-2' />
                  <p className='text-xs text-muted-foreground'>
                    Add one-time events like inheritance, selling a car, or
                    large expenses.
                  </p>
                </div>
              ) : (
                <div className='space-y-3 max-h-[400px] overflow-y-auto pr-1'>
                  {params.oneTimeEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className='p-3 bg-muted/40 rounded-lg border space-y-3 relative group'
                    >
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-6 w-6 absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity'
                        onClick={() => {
                          setParams({
                            ...params,
                            oneTimeEvents: params.oneTimeEvents.filter(
                              (e) => e.id !== event.id,
                            ),
                          });
                        }}
                      >
                        <Minus className='w-3 h-3 text-destructive' />
                      </Button>

                      <Input
                        placeholder='Description'
                        className='h-8 text-xs bg-background'
                        value={event.description}
                        onChange={(e) => {
                          const newEvents = [...params.oneTimeEvents];
                          newEvents[index].description = e.target.value;
                          setParams({ ...params, oneTimeEvents: newEvents });
                        }}
                      />

                      <div className='grid grid-cols-2 gap-2'>
                        <div className='space-y-1'>
                          <Label className='text-[10px] uppercase text-muted-foreground'>
                            Year
                          </Label>
                          <Input
                            type='number'
                            min='1'
                            max={params.years}
                            className='h-8 text-xs bg-background'
                            value={event.year}
                            onChange={(e) => {
                              const newEvents = [...params.oneTimeEvents];
                              newEvents[index].year =
                                parseInt(e.target.value) || 1;
                              setParams({
                                ...params,
                                oneTimeEvents: newEvents,
                              });
                            }}
                          />
                        </div>
                        <div className='space-y-1'>
                          <Label className='text-[10px] uppercase text-muted-foreground'>
                            Amount ({displayCurrency})
                          </Label>
                          <Input
                            type='number'
                            className='h-8 text-xs bg-background'
                            value={toDisplay(event.amount)}
                            onChange={(e) => {
                              const displayVal =
                                parseFloat(e.target.value) || 0;
                              const mdlVal = convertCurrency(
                                displayVal,
                                displayCurrency,
                                'MDL',
                                exchangeRates,
                              );
                              const newEvents = [...params.oneTimeEvents];
                              newEvents[index].amount = mdlVal;
                              setParams({
                                ...params,
                                oneTimeEvents: newEvents,
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
