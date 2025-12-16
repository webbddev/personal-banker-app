import { getLatestRates } from '@/utils/exchange-rate-service';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';

const currencyInfo: {
  [key: string]: { name: string; flag: string };
} = {
  MDL: { name: 'Moldovan Leu', flag: '/flags/md.svg' },
  USD: { name: 'US Dollar', flag: '/flags/us.svg' },
  EUR: { name: 'Euro', flag: '/flags/eu.svg' },
  GBP: { name: 'British Pound', flag: '/flags/gb.svg' },
};

export async function ExchangeRatesDisplay() {
  const rates = await getLatestRates();

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader>
        <CardTitle>Live Exchange Rates</CardTitle>
        <CardDescription className='flex items-center gap-2'>
          Base currency:{' '}
          <Image
            src='/flags/md.svg'
            alt='MDL flag'
            width={20}
            height={15}
            className='object-cover'
          />
          MDL
        </CardDescription>{' '}
      </CardHeader>
      <CardContent className='flex-grow flex flex-col items-center justify-center'>
        <div className='w-full max-w-xl grid gap-3'>
          {Object.entries(rates).map(([currency, rate]) => {
            if (currency === 'MDL') return null;
            const info = currencyInfo[currency];
            return (
              <div
                key={currency}
                className='flex items-center justify-between rounded-md bg-muted/50 p-3'
              >
                <div className='flex items-center gap-4'>
                  <div className='relative h-10 w-10'>
                    {info?.flag && (
                      <Image
                        src={info.flag}
                        alt={`${currency} flag`}
                        fill
                        className='rounded-full object-cover'
                      />
                    )}
                  </div>
                  <div>
                    <p className='font-bold text-md'>{currency}</p>
                    <p className='text-sm text-muted-foreground'>
                      {info?.name}
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-lg font-semibold'>{rate.toFixed(2)}</p>
                  <p className='text-xs text-muted-foreground'>MDL</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
