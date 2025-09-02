import { getLatestRates } from '@/utils/exchange-rate-service';

export async function ExchangeRatesDisplay() {
  const rates = await getLatestRates();

  return (
    <div className='w-60 rounded-lg border bg-card text-card-foreground shadow-sm p-4 h-full'>
      <h2 className='text-xl font-semibold mb-4'>Live Exchange Rates</h2>
      <div className='flex flex-col space-y-2'>
        {Object.entries(rates).map(([currency, rate]) => {
          if (currency === 'MDL') return null;
          return (
            <div
              key={currency}
              className='flex items-center justify-between rounded-lg border px-4 py-2 text-sm font-medium'
            >
              <span className='font-bold'>{currency}</span>
              <span className='text-muted-foreground'>{rate.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
