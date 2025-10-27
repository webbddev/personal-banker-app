'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import { Investment } from '@prisma/client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { calculateDaysUntilExpiration } from '@/utils/investment-calculations';

export const description = 'An interactive bar chart of investments';

export function ChartBarInteractive({ data }: { data: Investment[] }) {
  const chartConfig = {
    investmentAmount: {
      label: 'Investment Amount',
      // color: 'hsl(var(--chart-6))',
      color: '#40C1AC',
    },
    expiringSoon: {
      label: 'Expiring Soon',
      color: 'hsl(var(--chart-3))',
    },
    expiringIn7Days: {
      label: 'Expiring in 7 Days',
      color: 'hsl(var(--chart-3))',
    },
  } satisfies ChartConfig;

  const chartData = data.map((investment) => {
    const expirationDate = new Date(investment.expirationDate);
    const daysUntilExpiration = calculateDaysUntilExpiration(expirationDate);
    const isExpiringIn7Days =
      daysUntilExpiration > 0 && daysUntilExpiration <= 7;
    const isExpiringSoon = daysUntilExpiration > 0 && daysUntilExpiration <= 30;

    let fill;
    if (isExpiringIn7Days) {
      fill = 'var(--color-expiringIn7Days)';
    } else if (isExpiringSoon) {
      fill = 'var(--color-expiringSoon)';
    } else {
      fill = 'var(--color-investmentAmount)';
    }

    return {
      ...investment,
      expirationDateFormatted: expirationDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      fill,
    };
  });

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='text-xl lg:text-2xl'>
          Investment Portfolio Overview
        </CardTitle>
        <CardDescription className='lg:text-base'>
          Each bar represents an investment, ordered by expiration date.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] md:h-[300px] lg:h-[350px] 2xl:h-[600px] w-full'
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              right: 40,
              bottom: 20,
              left: 10,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='expirationDateFormatted'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              dataKey='investmentAmount'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value.toLocaleString()}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) => (
                    <div className='flex flex-col gap-1 rounded-lg bg-background p-2 shadow-sm text-sm lg:text-base'>
                      <span className='font-bold'>
                        {props.payload.organisationName}
                      </span>
                      <span>Amount: {Number(value).toLocaleString()}</span>
                      <span>
                        Expires: {props.payload.expirationDateFormatted}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey='investmentAmount' radius={4}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
