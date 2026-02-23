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
import {
  TrendingUp,
  Activity,
  Database,
  Mail,
  Bell,
  CheckCircle2,
  ArrowRightLeft,
  FileText,
  Clock,
  Code,
  Globe,
  PlusCircle,
  Share2,
} from 'lucide-react';

/**
 * MOCK DATA
 */
const data = [
  { name: 'Jan W1', base: 6.0, inflation: 7.2 },
  { name: 'Jan W2', base: 6.0, inflation: 7.0 },
  { name: 'Jan W3', base: 6.0, inflation: 6.8 },
  { name: 'Jan W4', base: 5.0, inflation: 6.8 },
  { name: 'Feb W1', base: 5.0, inflation: 6.5 },
  { name: 'Feb W2', base: 4.75, inflation: 6.2 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-white border border-slate-200 p-3 rounded-lg shadow-lg'>
        <p className='text-slate-500 text-[10px] font-bold mb-2 uppercase tracking-widest'>
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div
            key={index}
            className='flex items-center justify-between gap-6 py-1'
          >
            <div className='flex items-center gap-2'>
              <div
                className='w-2 h-2 rounded-full'
                style={{ backgroundColor: entry.color }}
              />
              <span className='text-xs text-slate-600 font-medium'>
                {entry.name}
              </span>
            </div>
            <span className='text-xs font-mono font-bold text-slate-900'>
              {entry.value.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function N8NDocsPageFinal() {
  return (
    <div className='min-h-screen bg-slate-50 font-sans text-slate-900 pb-24'>
      {/* 1. HERO SECTION */}
      <header className='bg-[#0f172a] text-white overflow-hidden relative border-b border-slate-800'>
        <div className='absolute inset-0 bg-gradient-to-br from-blue-600/20 to-emerald-500/20 opacity-50' />
        <div className='container mx-auto px-6 py-24 text-center relative z-10'>
          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-bold uppercase tracking-widest mb-6'>
            <Activity size={14} /> Workflow Documentation
          </div>
          <h1 className='text-4xl md:text-6xl font-extrabold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400'>
            n8n Economic Monitor
          </h1>
          <p className='text-lg md:text-xl font-light text-slate-400 max-w-2xl mx-auto leading-relaxed'>
            Real-time tracking of National Bank of Moldova indicators with
            automated change detection and stakeholder alerting.
          </p>
        </div>
      </header>

      <main className='container mx-auto px-4 py-16 max-w-6xl'>
        {/* 2. TOP CONTEXT SECTION */}
        <section className='grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24 items-start'>
          <div className='lg:col-span-5 space-y-8'>
            <div className='bg-white p-8 rounded-2xl shadow-sm border border-slate-200 border-l-[6px] border-l-amber-500'>
              <h2 className='text-sm font-black text-amber-600 uppercase tracking-widest mb-3'>
                Objective
              </h2>

              <p className='text-slate-600 leading-relaxed text-lg'>
                This automated workflow executes daily data collection from {' '}
                <span className='text-slate-900 font-semibold'>
                  Trading Economics
                </span>
                , performs intelligent comparison by benchmarking current data
                against historical records stored in{' '}
                <span className='text-slate-900 font-semibold'>
                  Google Sheets
                </span>
                , and delivers instant notifications only when changes are
                detected.
              </p>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-4'>
                <div className='p-2 bg-blue-50 text-blue-600 rounded-lg'>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div className='text-[10px] font-bold text-slate-400 uppercase'>
                    Base Rate
                  </div>
                  <div className='text-sm font-bold'>4.75%</div>
                </div>
              </div>
              <div className='p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-4'>
                <div className='p-2 bg-emerald-50 text-emerald-600 rounded-lg'>
                  <Activity size={20} />
                </div>
                <div>
                  <div className='text-[10px] font-bold text-slate-400 uppercase'>
                    Inflation
                  </div>
                  <div className='text-sm font-bold'>6.20%</div>
                </div>
              </div>
            </div>
          </div>

          <div className='lg:col-span-7 bg-white p-8 rounded-3xl shadow-xl border border-slate-200'>
            <div className='flex justify-between items-center mb-8'>
              <h3 className='font-bold text-slate-800 tracking-tight'>
                Hypothetical Rate Trends
              </h3>
              <div className='flex gap-3'>
                <div className='flex items-center gap-1'>
                  <div className='w-2 h-2 rounded-full bg-blue-500' />
                  <span className='text-[9px] font-bold text-slate-500 uppercase'>
                    Base
                  </span>
                </div>
                <div className='flex items-center gap-1'>
                  <div className='w-2 h-2 rounded-full bg-emerald-500' />
                  <span className='text-[9px] font-bold text-slate-500 uppercase'>
                    Inflation
                  </span>
                </div>
              </div>
            </div>
            <div className='h-[300px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart
                  data={data}
                  margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id='cBlue' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.1} />
                      <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id='cEmerald' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#10b981' stopOpacity={0.1} />
                      <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    vertical={false}
                    stroke='#f1f5f9'
                  />
                  <XAxis
                    dataKey='name'
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type='monotone'
                    dataKey='base'
                    stroke='#3b82f6'
                    strokeWidth={3}
                    fill='url(#cBlue)'
                  />
                  <Area
                    type='monotone'
                    dataKey='inflation'
                    stroke='#10b981'
                    strokeWidth={3}
                    fill='url(#cEmerald)'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* 3. PHASE 1: DATA COLLECTION */}
        <section className='mb-14'>
          <div className='text-center mb-12 space-y-4'>
            <span className='px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-widest mb-4'>
              Phase 1
            </span>
            <h2 className='text-3xl font-bold text-slate-900'>
              Data Collection
            </h2>
            <p className='text-slate-600 max-w-2xl mx-auto'>
              Automated web scraping initiates data retrieval from Trading
              Economics via scheduled triggers
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='bg-white p-6 rounded-2xl border-t-4 border-cyan-500 shadow-sm border-x border-b border-slate-200'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-2 bg-cyan-50 text-cyan-600 rounded-lg'>
                  <Clock size={20} />
                </div>
                <h4 className='font-bold'>Schedule</h4>
              </div>
              <p className='text-xs text-slate-500 mb-4'>
                Runs daily at 09:00 AM UTC.
              </p>
              <div className='bg-slate-50 p-3 rounded font-mono text-[10px] text-slate-600'>
                Interval: 1 Day
              </div>
            </div>
            <div className='bg-white p-6 rounded-2xl border-t-4 border-blue-600 shadow-sm border-x border-b border-slate-200'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-2 bg-blue-50 text-blue-600 rounded-lg'>
                  <Globe size={20} />
                </div>
                <h4 className='font-bold'>HTTP Request</h4>
              </div>
              <p className='text-xs text-slate-500 mb-4'>
                GET tradingeconomics.com
              </p>
              <div className='bg-slate-50 p-3 rounded font-mono text-[10px] text-slate-600'>
                Header: User-Agent
              </div>
            </div>
            <div className='bg-white p-6 rounded-2xl border-t-4 border-purple-500 shadow-sm border-x border-b border-slate-200'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-2 bg-purple-50 text-purple-600 rounded-lg'>
                  <Code size={20} />
                </div>
                <h4 className='font-bold'>HTML Extract</h4>
              </div>
              <p className='text-xs text-slate-500 mb-4'>
                Selector: .table-hover td
              </p>
              <div className='bg-slate-50 p-3 rounded font-mono text-[10px] text-slate-600'>
                Target: nth-child(2)
              </div>
            </div>
          </div>
          <div className='hidden md:block h-8 border-l-2 border-dashed border-slate-300 mx-auto w-0 my-4'></div>
        </section>

        {/* 4. PHASE 2: NORMALIZATION */}
        <section className='mb-14'>
          <div className='text-center mb-12 space-y-4'>
            <span className='px-4 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-widest mb-4'>
              Phase 2
            </span>
            <h2 className='text-3xl font-bold text-slate-900'>
              Normalization & Retrieval
            </h2>
            <p className='text-slate-600 max-w-2xl mx-auto'>
              Transform and validate scraped data while retrieving historical
              context for comparison
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='bg-white p-6 rounded-2xl border-t-4 border-blue-500 shadow-sm border-x border-b border-slate-200'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-2 bg-slate-50 text-slate-600 rounded-lg'>
                  <ArrowRightLeft size={20} />
                </div>
                <h4 className='font-bold'>Merge Data</h4>
              </div>
              <p className='text-xs text-slate-500 mb-4'>
                Combines parallel branches.
              </p>
              <div className='bg-slate-50 p-3 rounded font-mono text-[10px] text-slate-600'>
                Mode: Wait for all
              </div>
            </div>
            <div className='bg-white p-6 rounded-2xl border-t-4 border-blue-500 shadow-sm border-x border-b border-slate-200'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-2 bg-blue-50 text-blue-600 rounded-lg'>
                  <FileText size={20} />
                </div>
                <h4 className='font-bold'>Edit Fields</h4>
              </div>
              <div className='space-y-1 text-[10px] font-mono text-blue-600'>
                <div>InterestRate: Number(val)</div>
                <div>InflationRate: Number(val)</div>
              </div>
            </div>
            <div className='bg-white p-6 rounded-2xl border-t-4 border-amber-500 shadow-sm border-x border-b border-slate-200'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-2 bg-amber-50 text-amber-600 rounded-lg'>
                  <Database size={20} />
                </div>
                <h4 className='font-bold'>Google Sheets</h4>
              </div>
              <p className='text-xs text-slate-500 mb-4'>
                Retrieves the last row recorded.
              </p>
              <div className='bg-slate-50 p-3 rounded font-mono text-[10px] text-slate-600'>
                Limit: 1 (Descending)
              </div>
            </div>
          </div>
          <div className='hidden md:block h-8 border-l-2 border-dashed border-slate-300 mx-auto w-0 my-4'></div>
        </section>

        {/* 5. PHASE 3: CHANGE DETECTION (IF NODE) */}
        <section className='mb-24'>
          <div className='max-w-4xl mx-auto'>
            <div className='text-center mb-12 space-y-4'>
              <span className='px-4 py-1 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-widest'>
                Phase 3
              </span>
              <h2 className='text-3xl font-bold text-slate-900'>
                Decision Logic
              </h2>
              <p className='text-slate-600 max-w-2xl mx-auto'>
                The workflow acts as an intelligent filter. It compares the
                freshly scraped data against historical records to prevent
                redundant notifications.
              </p>
            </div>

            {/* Main Decision Card */}
            <div className='relative p-12 bg-[#0f172a] rounded-[3rem] shadow-2xl border border-slate-800 overflow-hidden'>
              <div className='absolute top-0 right-0 p-8 opacity-5 text-white'>
                <ArrowRightLeft size={120} />
              </div>

              <div className='relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24'>
                <div className='text-center'>
                  <div className='text-[10px] font-bold text-indigo-400 uppercase mb-3 tracking-widest opacity-80'>
                    Live Scraped Data
                  </div>
                  <div className='text-5xl font-mono font-bold text-white tracking-tighter'>
                    5.00%
                  </div>
                </div>
                <div className='relative'>
                  <div className='w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center border-2 border-slate-700 shadow-inner'>
                    <span className='text-2xl font-bold text-indigo-400'>
                      ≠
                    </span>
                  </div>
                  <div className='absolute inset-0 rounded-full bg-indigo-500/20 animate-ping' />
                </div>
                <div className='text-center'>
                  <div className='text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest'>
                    Last Known Record
                  </div>
                  <div className='text-5xl font-mono font-bold text-slate-400 tracking-tighter'>
                    6.00%
                  </div>
                </div>
              </div>

              {/* Logic Branching UI */}
              <div className='mt-16 pt-10 border-t border-slate-800/50 relative'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  {/* TRUE BRANCH - Success Path */}
                  <div className='group relative p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center text-center shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all duration-300 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] cursor-default'>
                    <div className='absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full shadow-lg tracking-widest transition-transform group-hover:scale-110'>
                      TRUE
                    </div>
                    <div className='p-3 bg-emerald-500/20 rounded-full text-emerald-400 mb-4 transition-colors group-hover:bg-emerald-500/30 group-hover:text-emerald-300'>
                      <CheckCircle2 size={28} />
                    </div>
                    <h4 className='text-white font-bold text-lg mb-2 transition-colors group-hover:text-emerald-50'>
                      Change Detected
                    </h4>
                    <p className='text-emerald-100/70 text-sm leading-relaxed max-w-[240px] transition-colors group-hover:text-emerald-100'>
                      New data found. Proceeding to update database and alert
                      stakeholders.
                    </p>
                  </div>

                  {/* FALSE BRANCH - Terminated Path (Red-ish Look) */}
                  <div className='group relative p-8 rounded-3xl bg-rose-950/20 border border-rose-900/40 flex flex-col items-center text-center shadow-[0_0_18px_rgba(225,29,72,0.1)] transition-all duration-300 hover:bg-rose-900/30 hover:border-rose-500/50 hover:shadow-[0_0_25px_rgba(225,29,72,0.2)] cursor-default'>
                    <div className='absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-rose-600 text-white text-[10px] font-black rounded-full shadow-lg tracking-widest transition-transform group-hover:scale-110 group-hover:bg-rose-500'>
                      FALSE
                    </div>
                    <div className='p-3 bg-rose-500/10 rounded-full text-rose-400/80 mb-4 transition-colors group-hover:bg-rose-500/20 group-hover:text-rose-300'>
                      <Bell size={28} />
                    </div>
                    <h4 className='text-rose-100/90 font-bold text-lg mb-2 transition-colors group-hover:text-white'>
                      No Variation
                    </h4>
                    <p className='text-rose-200/50 text-sm leading-relaxed max-w-[240px] transition-colors group-hover:text-rose-100/80'>
                      Incoming data matches the latest stored record. Workflow
                      exits safely without triggering notifications.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='hidden md:block h-12 border-l-2 border-dashed border-slate-300 mx-auto w-0 mt-8'></div>
        </section>

        {/* 6. PHASE 4: ACTION (SHEETS & GMAIL) */}
        <section className='mb-14'>
          <div className='text-center mb-12 space-y-4'>
            <span className='px-4 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest mb-4'>
              Phase 4
            </span>
            <h2 className='text-3xl font-bold text-slate-900'>
              Persistence & Alerting
            </h2>
            <p className='text-slate-600 max-w-2xl mx-auto'>
              Record changes to persistent storage and dispatch real-time
              notifications
            </p>
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
            {/* Sheet Card */}
            <div className='bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden'>
              <div className='bg-emerald-600 p-6 text-white flex justify-between items-center'>
                <div className='flex items-center gap-3'>
                  <PlusCircle size={24} />
                  <h3 className='font-bold'>Update Historical Ledger</h3>
                </div>
                <span className='text-[10px] bg-emerald-700 px-2 py-1 rounded uppercase font-bold'>
                  Google Sheets
                </span>
              </div>
              <div className='p-8'>
                <table className='w-full text-xs text-left'>
                  <thead className='text-slate-400 border-b border-slate-100 uppercase tracking-widest'>
                    <tr>
                      <th className='pb-3'>Date</th>
                      <th className='pb-3 text-right'>Base Rate</th>
                      <th className='pb-3 text-right'>Inflation</th>
                    </tr>
                  </thead>
                  <tbody className='text-slate-700 font-medium'>
                    <tr className='bg-emerald-50/50'>
                      <td className='py-4'>22.01.2026</td>
                      <td className='text-right text-emerald-600'>5.00%</td>
                      <td className='text-right'>6.20%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* Gmail Card */}
            <div className='bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden'>
              <div className='bg-blue-600 p-6 text-white flex justify-between items-center'>
                <div className='flex items-center gap-3'>
                  <Mail size={24} />
                  <h3 className='font-bold'>Stakeholder Alert</h3>
                </div>
                <span className='text-[10px] bg-blue-700 px-2 py-1 rounded uppercase font-bold'>
                  Gmail
                </span>
              </div>
              <div className='p-8'>
                <div className='border border-slate-100 p-5 rounded-2xl shadow-inner bg-slate-50'>
                  <div className='text-xs font-bold mb-1'>
                    Subject: 🚨 Policy Rate Change Detected
                  </div>
                  <div className='text-[10px] text-slate-400 mb-4 border-b pb-2'>
                    From: n8n-system@automated.com
                  </div>
                  <div className='p-3 bg-white rounded-xl border border-blue-100'>
                    <div className='text-[11px] font-bold text-blue-900'>
                      NEW INTEREST RATE: 5.00%
                    </div>
                    <div className='text-[9px] text-blue-500'>
                      Movement: -100 bps from previous 6.00%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className='text-center border-t border-slate-200 pt-12'>
          <p className='text-slate-400 text-xs font-bold uppercase tracking-[0.4em]'>
            n8n Workflow Documentation • Enterprise Edition
          </p>
        </footer>
      </main>
    </div>
  );
}
