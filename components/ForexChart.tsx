'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  CandlestickSeries,
  ColorType,
  UTCTimestamp,
} from 'lightweight-charts';
import type { ISeriesApi, IChartApi } from 'lightweight-charts';

const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY;

// Interval mapping for Twelve Data (REST and WS)
const INTERVAL_MAP: Record<string, string> = {
  '1m': '1min',
  '5m': '5min',
  '15m': '15min',
  '1h': '1h',
  '4h': '4h',
  '1d': '1day',
  Weekly: '1week',
  Monthly: '1month',
};

interface ForexChartProps {
  symbol: string;
  interval: string;
}

export default function ForexChart({ symbol, interval }: ForexChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'live' | 'error'>(
    'connecting'
  );

  const tdInterval = INTERVAL_MAP[interval] || '1min';

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: window.innerWidth < 640 ? 300 : 550,
      layout: {
        background: { type: ColorType.Solid, color: '#131722' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#1f2943' },
        horzLines: { color: '#1f2943' },
      },
      timeScale: { timeVisible: true, borderColor: '#2b2b43' },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver((entries) => {
      chart.applyOptions({ width: entries[0].contentRect.width });
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  // REST + WebSocket Logic
  useEffect(() => {
    if (!seriesRef.current || !API_KEY) return;

    // 1. History fetch via REST
    const fetchHistory = async () => {
      try {
        const response = await fetch(
          `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${tdInterval}&outputsize=500&apikey=${API_KEY}`
        );
        const data = await response.json();

        if (data.status === 'ok') {
          const formattedData = data.values
            .map((d: any) => ({
              time: (new Date(d.datetime).getTime() / 1000) as UTCTimestamp,
              open: parseFloat(d.open),
              high: parseFloat(d.high),
              low: parseFloat(d.low),
              close: parseFloat(d.close),
            }))
            .reverse();
          seriesRef.current?.setData(formattedData);
          chartRef.current?.timeScale().fitContent();
        }
      } catch (err) {
        console.error('Twelve Data REST Error:', err);
      }
    };

    fetchHistory();

    // 2. WebSocket for live candles (time_series event)
    const ws = new WebSocket(
      `wss://ws.twelvedata.com/v1/quotes/price?apikey=${API_KEY}`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      // subscription to aggregated candles
      ws.send(
        JSON.stringify({
          action: 'subscribe',
          params: {
            symbols: symbol,
            event: 'time_series',
            interval: tdInterval,
          },
        })
      );
      setStatus('live');
    };

    // Heartbeat every 15 seconds
    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: 'heartbeat' }));
      }
    }, 15000);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === 'time_series' && data.symbol === symbol) {
        seriesRef.current?.update({
          time: data.timestamp as UTCTimestamp,
          open: parseFloat(data.open),
          high: parseFloat(data.high),
          low: parseFloat(data.low),
          close: parseFloat(data.close),
        });
      }
    };

    ws.onerror = () => setStatus('error');

    return () => {
      clearInterval(heartbeat);
      ws.close();
    };
  }, [symbol, tdInterval]);

  return (
    <div className='relative w-full'>
      <div className='absolute top-2 left-2 z-10 flex items-center gap-2'>
        <div
          className={`w-2 h-2 rounded-full ${status === 'live' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}
        />
        <span className='text-[10px] text-gray-400 uppercase font-bold tracking-widest'>
          {status === 'live' ? 'Live Stream' : 'Connecting'}
        </span>
      </div>
      <div ref={chartContainerRef} className='w-full' />
    </div>
  );
}
