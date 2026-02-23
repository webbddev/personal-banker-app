import {
  LineChart as LineChartIcon,
  TrendingUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProjectionPoint } from '@/utils/simulator-calculations';
import {
  convertCurrency,
  ExchangeRates,
  SupportedCurrencyCode,
} from '@/utils/currency-formatter';

interface GrowthChartProps {
  data: ProjectionPoint[];
  displayCurrency: SupportedCurrencyCode;
  exchangeRates: ExchangeRates;
}

export function GrowthChart({
  data,
  displayCurrency,
  exchangeRates,
}: GrowthChartProps) {
  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  const convertedData = data.map((point) => ({
    ...point,
    nominalTotal: convertCurrency(
      point.nominalTotal,
      'MDL',
      displayCurrency,
      exchangeRates
    ),
    realTotal: convertCurrency(
      point.realTotal,
      'MDL',
      displayCurrency,
      exchangeRates
    ),
  }));

  return (
    <Card className='w-full h-full'>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChartIcon className="w-5 h-5 text-primary" />
          Wealth Projection ({displayCurrency})
        </CardTitle>
        <CardDescription>
          Visualizing nominal vs. inflation-adjusted growth
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='h-[350px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={convertedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                vertical={false}
                stroke='hsl(var(--muted-foreground) / 0.1)'
              />
              <XAxis
                dataKey='year'
                stroke='hsl(var(--muted-foreground))'
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke='hsl(var(--muted-foreground))'
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                }}
                itemStyle={{ fontSize: '12px' }}
                formatter={(value: number) => [
                  value.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  }) +
                    ' ' +
                    displayCurrency,
                  '',
                ]}
              />
              <Legend verticalAlign='top' height={36} />
              <Line
                name='Nominal Value'
                type='monotone'
                dataKey='nominalTotal'
                stroke='hsl(var(--primary))'
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                name='Real Value (Inflation Adj.)'
                type='monotone'
                dataKey='realTotal'
                stroke='hsl(var(--muted-foreground))'
                strokeWidth={2}
                strokeDasharray='5 5'
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
