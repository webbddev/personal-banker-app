import { getLatestRates } from '@/utils/exchange-rate-service';
import { fetchBnmBaseRate } from '@/utils/bnm-scraper';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { ExchangeRatesList } from './ExchangeRatesList';

export async function ExchangeRatesDisplay() {
  // 1. Fetch data on the server (Secure and fast)
  const [rates, baseRate] = await Promise.all([
    getLatestRates(),
    fetchBnmBaseRate(),
  ]);

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader className='pb-3'>
        <CardTitle>Live Exchange Rates</CardTitle>
        <CardDescription className='flex items-center gap-2'>
          Base currency:{' '}
          <Image src='/flags/md.svg' alt='MDL flag' width={20} height={15} />
          MDL
        </CardDescription>
      </CardHeader>

      {/* 2. Pass the data to the Client Component for interactivity */}
      <ExchangeRatesList rates={rates} />

      {/* 3. Display the National Base Rate */}
      {baseRate !== null && (
        <div className='p-4 pt-1 mt-auto border-t border-border/50'>
          <div className='flex items-center justify-between rounded-md p-3 bg-muted/40 border border-transparent hover:border-border transition-colors'>
            <div className='flex items-center gap-4'>
              {/* Use the MD flag icon here similar to currencies but for BNM */}
              <div className='relative h-10 w-10 shrink-0'>
                <Image
                  src='/flags/md.svg'
                  alt='MDL flag'
                  fill
                  className='rounded-full object-cover shadow-sm bg-white p-0.5'
                />
              </div>
              <div className='min-w-0'>
                <p className='font-bold text-md truncate text-primary/90'>
                  BNM Base Rate
                </p>
                <p className='text-xs text-muted-foreground truncate'>
                  National Bank of Moldova
                </p>
              </div>
            </div>
            <div className='text-right shrink-0'>
              <p className='text-lg font-bold text-primary'>
                {baseRate.toFixed(2)}%
              </p>
              <p className='text-[10px] text-muted-foreground uppercase tracking-wider'>
                Interest
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
