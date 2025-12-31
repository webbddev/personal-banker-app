'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  CandlestickSeries,
  ColorType,
  UTCTimestamp,
} from 'lightweight-charts';
import type { ISeriesApi, IChartApi } from 'lightweight-charts';

type BinanceKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  ...unknown[],
];
interface BinanceWsMessage {
  k: { t: number; o: string; h: string; l: string; c: string; x: boolean };
}

const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d'] as const;
type Interval = (typeof INTERVALS)[number];

export default function EurUsdChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<Interval>('1m');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const getChartHeight = () => {
      if (typeof window === 'undefined') return 400;
      if (window.innerWidth < 640) return 300; // Mobile height
      if (window.innerWidth < 1024) return 380; // iPad height
      return 450; // Laptop height
    };

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: getChartHeight(),
      layout: {
        background: { type: ColorType.Solid, color: '#131722' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#1f2943' },
        horzLines: { color: '#1f2943' },
      },
      timeScale: {
        timeVisible: true,
        borderColor: '#2b2b43',
      },
      rightPriceScale: {
        borderColor: '#2b2b43',
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    seriesRef.current = candleSeries;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0].contentRect.width > 0 && chartRef.current) {
        chartRef.current.applyOptions({
          width: entries[0].contentRect.width,
          height: getChartHeight(),
        });
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || !seriesRef.current) return;

    const SYMBOL = 'EURUSDT';
    const REST_URL = `https://api.binance.com/api/v3/klines?symbol=${SYMBOL}&interval=${selectedInterval}&limit=150`;
    const WS_URL = `wss://stream.binance.com:9443/ws/${SYMBOL.toLowerCase()}@kline_${selectedInterval}`;

    seriesRef.current.setData([]);

    fetch(REST_URL)
      .then((res) => res.json())
      .then((data: BinanceKline[]) => {
        const history = data.map((k) => ({
          time: (k[0] / 1000) as UTCTimestamp,
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
        }));
        seriesRef.current?.setData(history);
        chartRef.current?.timeScale().fitContent();
      });

    const ws = new WebSocket(WS_URL);
    ws.onmessage = (event) => {
      const msg: BinanceWsMessage = JSON.parse(event.data);
      const k = msg.k;
      seriesRef.current?.update({
        time: (k.t / 1000) as UTCTimestamp,
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
      });
    };

    return () => {
      ws.close();
    };
  }, [selectedInterval]);

  return (
    <div className='w-full'>
      {/* Timeframe Controls - Stacked on Mobile, Row on Desktop */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 bg-[#1e222d] p-3 rounded-lg'>
        <div className='flex items-center gap-2'>
          <span className='text-gray-300 text-xs font-bold px-1 uppercase tracking-wider'>
            EUR / USDT
          </span>
          <span className='bg-green-500/10 text-green-500 text-[10px] px-2 py-0.5 rounded border border-green-500/20'>
            Live
          </span>
        </div>

        {/* Scrollable button container for Mobile/iPad */}
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

      <div ref={chartContainerRef} className='w-full' />

      <p className='mt-2 text-[10px] text-gray-500 text-center italic'>
        Source: Binance WebSocket Stream • {selectedInterval} Interval
      </p>
    </div>
  );
}
