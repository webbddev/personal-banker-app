import { getLatestRates } from '@/utils/exchange-rate-service';
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
  const rates = await getLatestRates();

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader>
        <CardTitle>Live Exchange Rates</CardTitle>
        <CardDescription className='flex items-center gap-2'>
          Base currency:{' '}
          <Image src='/flags/md.svg' alt='MDL flag' width={20} height={15} />
          MDL
        </CardDescription>
      </CardHeader>

      {/* 2. Pass the data to the Client Component for interactivity */}
      <ExchangeRatesList rates={rates} />
    </Card>
  );
}
