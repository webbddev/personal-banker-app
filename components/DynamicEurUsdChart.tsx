// @/components/DynamicEurUsdChart.tsx
'use client';

import dynamic from 'next/dynamic';

const EurUsdChart = dynamic(
  () => import('./EurUsdChart').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-900 rounded-xl">
        <p className="text-gray-400">Loading live chart...</p>
      </div>
    ),
  }
);

export default function DynamicEurUsdChart() {
  return <EurUsdChart />;
}