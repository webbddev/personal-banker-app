'use client';

import { useEffect, useState } from 'react';
import ForexChart from './ForexChart';

const INTERVALS = [
  'Monthly',
  'Weekly',
  '1d',
  '4h',
  '1h',
  '15m',
  '5m',
  '1m',
] as const;
type Interval = (typeof INTERVALS)[number];

type ForexChartContainerProps = {
  symbol?: string;
};

export default function ForexChartContainer({
  symbol = 'EUR/USD',
}: ForexChartContainerProps) {
  const [selectedInterval, setSelectedInterval] = useState<Interval>('1d');
  const [debouncedInterval, setDebouncedInterval] = useState<Interval>('1d');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInterval(selectedInterval);
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [selectedInterval]);

  return (
    <div className='w-full'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 bg-[#1e222d] p-3 rounded-lg'>
        <div className='flex items-center gap-2'>
          <span className='text-gray-300 text-xs font-bold px-1 uppercase tracking-wider'>
            {symbol.replace('/', ' / ')}
          </span>
        </div>

        <div className='flex gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar'>
          {INTERVALS.map((int) => (
            <button
              key={int}
              onClick={() => setSelectedInterval(int)}
              className={`px-3 py-2 text-[10px] font-bold rounded transition-all shrink-0 ${
                selectedInterval === int
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {int.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <ForexChart symbol={symbol} interval={debouncedInterval} />

      <p className='mt-2 text-[10px] text-gray-500 text-center italic'>
        Source: Twelve Data • {selectedInterval} Interval
      </p>
    </div>
  );
}
