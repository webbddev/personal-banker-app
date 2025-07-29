import {
  CURRENCY_OPTIONS,
  formatAmount,
  convertCurrency,
  SupportedCurrency,
} from '@/utils/currency-formatter';
import { useInvestmentStore } from '@/store/financialInvestmentsStore';

export function CurrencyEquivalentTotal() {
  const currencyTotals = useInvestmentStore((state) => state.currencyTotals);

  return (
    <div className='mt-4 space-y-4'>
      {Object.entries(currencyTotals).map(([currency, amount]) => (
        <div key={currency} className='space-y-1'>
          <p className='font-medium'>
            Total invested in {currency}:{' '}
            {formatAmount(amount, currency.toLowerCase())}
          </p>
          <div className='text-sm text-muted-foreground pl-4 space-y-1'>
            {CURRENCY_OPTIONS.filter((option) => option.label !== currency).map(
              (option) => {
                const convertedAmount = convertCurrency(
                  amount,
                  currency as SupportedCurrency,
                  option.label as SupportedCurrency
                );
                return (
                  <p key={option.value}>
                    {option.label} equivalent:{' '}
                    {formatAmount(convertedAmount, option.value)}
                  </p>
                );
              }
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
