'use client';

import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const data = [
  { name: 'Jan W1', base: 6.0, inflation: 7.2 },
  { name: 'Jan W2', base: 6.0, inflation: 7.0 },
  { name: 'Jan W3', base: 6.0, inflation: 6.8 },
  { name: 'Jan W4', base: 5.0, inflation: 6.8 },
  { name: 'Feb W1', base: 5.0, inflation: 6.5 },
  { name: 'Feb W2', base: 4.75, inflation: 6.2 },
];

export default function N8NDocsPage() {
  return (
    <div className='min-h-screen bg-white font-sans text-slate-900'>
      {/* Hero Section: Matches Screenshot Gradient */}
      <header className='bg-gradient-to-r from-[#2b64f1] to-[#08b1d9] text-white py-16 px-6 text-center shadow-md'>
        <h1 className='text-4xl md:text-5xl font-bold mb-4 tracking-tight'>
          n8n Automated Economic Monitor
        </h1>
        <p className='text-lg md:text-xl font-medium opacity-90 max-w-3xl mx-auto leading-relaxed'>
          A robust workflow for tracking National Bank of Moldova (NBM)
          indicators, detecting changes, and automating alerts.
        </p>
      </header>

      <main className='container mx-auto px-4 py-16 max-w-6xl'>
        {/* Top Section: Split Layout from Screenshot */}
        <section className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20 items-start'>
          {/* Left Column: Context Cards */}
          <div className='space-y-6'>
            <div className='bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 border-l-[6px] border-l-[#f59e0b]'>
              <h2 className='text-2xl font-bold text-slate-800 mb-4'>
                The Objective
              </h2>
              <p className='text-slate-500 leading-relaxed text-[15px]'>
                Manually checking the National Bank's website for rate changes
                is inefficient. This automated workflow triggers daily, scrapes
                the latest data from Trading Economics, compares it against
                historical records, and instantly notifies the user only when a
                significant change occurs.
              </p>
            </div>

            <div className='bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 border-l-[6px] border-l-[#3b82f6]'>
              <h2 className='text-2xl font-bold text-slate-800 mb-4'>
                Key Metrics Monitored
              </h2>
              <ul className='space-y-4'>
                <li className='flex items-center gap-3'>
                  <div className='w-3 h-3 bg-[#3b82f6] rounded-full' />
                  <span className='font-bold text-slate-700 text-[15px]'>
                    Base Interest Rate
                  </span>
                </li>
                <li className='flex items-center gap-3'>
                  <div className='w-3 h-3 bg-[#10b981] rounded-full' />
                  <span className='font-bold text-slate-700 text-[15px]'>
                    Inflation Rate
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: The Refactored Chart */}
          <div className='bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100'>
            <h3 className='text-center font-bold text-slate-700 mb-6'>
              Monitoring Context: Hypothetical Rate Trends
            </h3>

            <div className='h-[300px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    {/* Upper Area: Emerald Variation */}
                    <linearGradient
                      id='colorEmerald'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop offset='5%' stopColor='#10b981' stopOpacity={0.6} />
                      <stop
                        offset='95%'
                        stopColor='#10b981'
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    {/* Lower Area: Taupe/Grey from Screenshot */}
                    <linearGradient id='colorBase' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#8c7e72' stopOpacity={0.5} />
                      <stop
                        offset='95%'
                        stopColor='#8c7e72'
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray='3 3'
                    vertical={true}
                    stroke='#e2e8f0'
                  />

                  <XAxis
                    dataKey='name'
                    axisLine={true}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    domain={[0, 8]}
                  />

                  <Tooltip />

                  {/* Inflation (Upper Area) */}
                  <Area
                    type='monotone'
                    dataKey='inflation'
                    stroke='#10b981'
                    strokeWidth={2}
                    fillOpacity={1}
                    fill='url(#colorEmerald)'
                  />

                  {/* Base Rate (Lower Area) */}
                  <Area
                    type='monotone'
                    dataKey='base'
                    stroke='#8c7e72'
                    strokeWidth={2}
                    fillOpacity={1}
                    fill='url(#colorBase)'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className='text-[11px] text-slate-400 text-center mt-6 italic'>
              Data generated for illustrative purposes to demonstrate the
              workflow's target metrics.
            </p>
          </div>
        </section>

        {/* Workflow Phase Breakdown */}
        <div className='space-y-16'>
          <section className='text-center'>
            <h2 className='text-3xl font-bold text-slate-800 mb-4'>
              Workflow Logic
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              {[
                {
                  step: '01',
                  title: 'Scrape',
                  desc: 'Daily HTTP trigger for NBM data.',
                },
                {
                  step: '02',
                  title: 'Retrieve',
                  desc: 'Get last record from Google Sheets.',
                },
                {
                  step: '03',
                  title: 'Compare',
                  desc: 'Boolean check for rate changes.',
                },
                {
                  step: '04',
                  title: 'Notify',
                  desc: 'Update Sheets and send Gmail alert.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className='p-6 bg-slate-50 rounded-xl border border-slate-200'
                >
                  <div className='text-blue-600 font-black text-xl mb-2'>
                    {item.step}
                  </div>
                  <div className='font-bold text-slate-800 mb-1'>
                    {item.title}
                  </div>
                  <div className='text-xs text-slate-500'>{item.desc}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className='text-center text-slate-400 text-sm mt-24 border-t pt-8'>
          <p>Generated based on n8n Workflow Architecture Documentation.</p>
        </footer>
      </main>
    </div>
  );
}
