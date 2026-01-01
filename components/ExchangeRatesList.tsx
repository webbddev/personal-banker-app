'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ForexChartContainer from './ForexChartContainer';

// Метаданные для отображения валют
const currencyInfo: Record<
  string,
  { name: string; flag: string; symbol: string }
> = {
  MDL: { name: 'Moldovan leu', flag: '/flags/md.svg', symbol: 'MDL' },
  USD: { name: 'USD Dollar', flag: '/flags/us.svg', symbol: 'USD/MDL' },
  EUR: { name: 'Euro', flag: '/flags/eu.svg', symbol: 'EUR/USD' },
  GBP: { name: 'British pound', flag: '/flags/gb.svg', symbol: 'GBP/USD' },
};

interface ExchangeRatesListProps {
  rates: Record<string, number>;
}

export function ExchangeRatesList({ rates }: ExchangeRatesListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

  // Обработка клика по валюте
  const handleCurrencyClick = (currency: string) => {
    // Разрешаем открытие чарта только для EUR и GBP (Forex пары в Twelve Data)
    if (currency === 'EUR' || currency === 'GBP') {
      setSelectedCurrency(currency);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <CardContent className='flex-grow'>
        <div className='w-full max-w-xl grid gap-3 mx-auto'>
          {Object.entries(rates).map(([currency, rate]) => {
            // Пропускаем базовую валюту MDL в списке, если нужно
            if (currency === 'MDL') return null;

            const info = currencyInfo[currency];
            const isClickable = currency === 'EUR' || currency === 'GBP';

            return (
              <div
                key={currency}
                className={`flex items-center justify-between rounded-md p-3 transition-all border border-transparent
                  ${
                    isClickable
                      ? 'bg-muted/50 hover:bg-muted cursor-pointer hover:border-blue-500/30'
                      : 'bg-muted/20 opacity-80 cursor-default'
                  }`}
                onClick={() => handleCurrencyClick(currency)}
              >
                <div className='flex items-center gap-4'>
                  <div className='relative h-10 w-10 shrink-0'>
                    {info?.flag && (
                      <Image
                        src={info.flag}
                        alt={`${currency} flag`}
                        fill
                        className='rounded-full object-cover'
                      />
                    )}
                  </div>
                  <div className='min-w-0'>
                    <p className='font-bold text-md truncate'>{currency}</p>
                    <p className='text-sm text-muted-foreground truncate'>
                      {info?.name || currency}
                    </p>
                  </div>
                </div>
                <div className='text-right shrink-0'>
                  <p className='text-lg font-semibold'>{rate.toFixed(2)}</p>
                  <p className='text-xs text-muted-foreground'>MDL</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {/* w-[95vw] — обеспечивает отступы по бокам на мобилках.
          max-h-[90vh] — чтобы модалка не уходила за пределы экрана.
          flex-col — для правильного распределения заголовка и графика.
        */}
        <DialogContent className='w-[95vw] sm:max-w-4xl lg:max-w-5xl bg-[#131722] border-gray-800 p-0 overflow-hidden rounded-2xl sm:rounded-xl outline-none max-h-[90vh] flex flex-col'>
          <DialogHeader className='p-4 sm:p-6 pb-2 shrink-0'>
            <DialogTitle className='text-white text-sm sm:text-xl pr-8 truncate'>
              {selectedCurrency === 'EUR' ? 'EUR / USD' : 'GBP / USD'} — Live
              Forex Market
            </DialogTitle>
          </DialogHeader>

          <div className='flex-grow overflow-y-auto p-2 sm:p-6 pt-0'>
            {/* Рендерим чарт только когда модалка открыта. 
               Передаем символ в формате Twelve Data (EUR/USD или GBP/USD).
            */}
            {isModalOpen && selectedCurrency && (
              <ForexChartContainer
                symbol={selectedCurrency === 'EUR' ? 'EUR/USD' : 'GBP/USD'}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
