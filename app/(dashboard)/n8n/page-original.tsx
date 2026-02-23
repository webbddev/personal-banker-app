// 'use client';

// import {
//   Area,
//   AreaChart,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from 'recharts';

// const data = [
//   { name: 'Jan W1', 'Base Rate (%)': 6.0, 'Inflation (%)': 7.2 },

//   { name: 'Jan W2', 'Base Rate (%)': 6.0, 'Inflation (%)': 7.0 },

//   { name: 'Jan W3', 'Base Rate (%)': 6.0, 'Inflation (%)': 6.8 },

//   { name: 'Jan W4', 'Base Rate (%)': 5.0, 'Inflation (%)': 6.8 },

//   { name: 'Feb W1', 'Base Rate (%)': 5.0, 'Inflation (%)': 6.5 },

//   { name: 'Feb W2', 'Base Rate (%)': 4.75, 'Inflation (%)': 6.2 },
// ];

// export default function N8NDocsPage() {
//   return (
//     <>
//       {/* Hero Section */}

//       <header className='bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-12 text-center shadow-lg'>
//         <h1 className='text-4xl md:text-5xl font-extrabold mb-4 tracking-tight'>
//           n8n Automated Economic Monitor
//         </h1>

//         <p className='text-xl md:text-2xl font-light opacity-90 max-w-3xl mx-auto'>
//           A robust workflow for tracking National Bank of Moldova (NBM)
//           indicators, detecting changes, and automating alerts.
//         </p>
//       </header>

//       <main className='container mx-auto px-4 py-12 max-w-6xl'>
//         {/* Introduction & Context */}

//         <section className='mb-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
//           <div className='space-y-6'>
//             <div className='bg-white p-6 rounded-xl shadow-md border-l-4 border-amber-500'>
//               <h2 className='text-2xl font-bold text-slate-800 mb-2'>
//                 The Objective
//               </h2>

//               <p className='text-slate-600 leading-relaxed'>
//                 Manually checking the National Bank's website for rate changes
//                 is inefficient. This automated workflow triggers daily, scrapes
//                 the latest data from Trading Economics, compares it against
//                 historical records, and instantly notifies the user only when a
//                 significant change occurs.
//               </p>
//             </div>

//             <div className='bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500'>
//               <h2 className='text-2xl font-bold text-slate-800 mb-2'>
//                 Key Metrics Monitored
//               </h2>

//               <ul className='space-y-2'>
//                 <li className='flex items-center'>
//                   <span className='w-3 h-3 bg-blue-500 rounded-full mr-3'></span>

//                   <span className='font-semibold text-slate-700'>
//                     Base Interest Rate
//                   </span>
//                 </li>

//                 <li className='flex items-center'>
//                   <span className='w-3 h-3 bg-amber-500 rounded-full mr-3'></span>

//                   <span className='font-semibold text-slate-700'>
//                     Inflation Rate
//                   </span>
//                 </li>
//               </ul>
//             </div>
//           </div>

//           <div className='bg-white p-6 rounded-xl shadow-md'>
//             <h3 className='text-lg font-bold text-slate-700 mb-4 text-center'>
//               Monitoring Context: Hypothetical Rate Trends
//             </h3>

//             <div className='chart-container h-[300px] max-h-[400px] w-full max-w-[600px] mx-auto relative'>
//               <ResponsiveContainer width='100%' height='100%'>
//                 <AreaChart data={data}>
//                   <defs>
//                     <linearGradient
//                       id='colorBaseRate'
//                       x1='0'
//                       y1='0'
//                       x2='0'
//                       y2='1'
//                     >
//                       <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.8} />

//                       <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
//                     </linearGradient>

//                     <linearGradient
//                       id='colorInflation'
//                       x1='0'
//                       y1='0'
//                       x2='0'
//                       y2='1'
//                     >
//                       <stop offset='5%' stopColor='#f59e0b' stopOpacity={0.8} />

//                       <stop offset='95%' stopColor='#f59e0b' stopOpacity={0} />
//                     </linearGradient>
//                   </defs>

//                   <CartesianGrid strokeDasharray='3 3' />

//                   <XAxis dataKey='name' />

//                   <YAxis />

//                   <Tooltip />

//                   <Area
//                     type='monotone'
//                     dataKey='Base Rate (%)'
//                     stroke='#3b82f6'
//                     fillOpacity={1}
//                     fill='url(#colorBaseRate)'
//                   />

//                   <Area
//                     type='monotone'
//                     dataKey='Inflation (%)'
//                     stroke='#f59e0b'
//                     fillOpacity={1}
//                     fill='url(#colorInflation)'
//                   />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>

//             <p className='text-xs text-slate-400 text-center mt-2 italic'>
//               Data generated for illustrative purposes to demonstrate the
//               workflow's target metrics.
//             </p>
//           </div>
//         </section>

//         {/* Phase 1: Web Scraping */}

//         <section className='mb-16'>
//           <div className='text-center mb-10'>
//             <span className='bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wide'>
//               Phase 1
//             </span>

//             <h2 className='text-3xl font-bold text-slate-800 mt-2'>
//               Data Collection (Web Scraping)
//             </h2>

//             <p className='text-slate-600 max-w-2xl mx-auto mt-2'>
//               The workflow initiates by mimicking a user visiting Trading
//               Economics to fetch real-time data.
//             </p>
//           </div>

//           <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
//             <div className='bg-white p-6 rounded-xl shadow-md border-t-4 border-cyan-500 relative'>
//               <div className='absolute -top-3 -right-3 bg-cyan-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow'>
//                 1
//               </div>

//               <h3 className='text-xl font-bold text-slate-800 mb-2'>
//                 Schedule Trigger
//               </h3>

//               <p className='text-sm text-slate-500 mb-4'>
//                 Runs daily (e.g., 09:00 AM)
//               </p>

//               <div className='bg-slate-50 p-3 rounded border border-slate-200 text-xs font-mono text-slate-600'>
//                 Trigger: Interval
//                 <br />
//                 Value: 1 Day
//               </div>
//             </div>

//             <div className='bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-600 relative'>
//               <div className='absolute -top-3 -right-3 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow'>
//                 2
//               </div>

//               <h3 className='text-xl font-bold text-slate-800 mb-2'>
//                 HTTP Request
//               </h3>

//               <p className='text-sm text-slate-500 mb-4'>
//                 Fetches HTML from target URLs
//               </p>

//               <div className='bg-slate-50 p-3 rounded border border-slate-200 text-xs font-mono text-slate-600'>
//                 GET: tradingeconomics.com
//                 <br />
//                 Header: User-Agent
//               </div>
//             </div>

//             <div className='bg-white p-6 rounded-xl shadow-md border-t-4 border-purple-500 relative'>
//               <div className='absolute -top-3 -right-3 bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow'>
//                 3
//               </div>

//               <h3 className='text-xl font-bold text-slate-800 mb-2'>
//                 HTML Extract
//               </h3>

//               <p className='text-sm text-slate-500 mb-4'>
//                 Parses values via CSS Selectors
//               </p>

//               <div className='bg-slate-50 p-3 rounded border border-slate-200 text-xs font-mono text-slate-600'>
//                 Selector: .table-hover
//                 <br />
//                 Target: td:nth-child(2)
//               </div>
//             </div>
//           </div>

//           <div className='hidden md:block h-8 border-l-2 border-dashed border-slate-300 mx-auto w-0 my-4'></div>
//         </section>

//         {/* Phase 2: Normalization & Retrieval */}

//         <section className='mb-16'>
//           <div className='text-center mb-10'>
//             <span className='bg-amber-100 text-amber-800 text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wide'>
//               Phase 2
//             </span>

//             <h2 className='text-3xl font-bold text-slate-800 mt-2'>
//               Normalization & Memory Retrieval
//             </h2>

//             <p className='text-slate-600 max-w-2xl mx-auto mt-2'>
//               Preparing the data for comparison by cleaning inputs and
//               retrieving historical context from Google Sheets.
//             </p>
//           </div>

//           <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
//             <div className='bg-white p-6 rounded-xl shadow-md border-t-4 border-slate-400 relative'>
//               <div className='absolute -top-3 -right-3 bg-slate-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow'>
//                 4
//               </div>

//               <h3 className='text-xl font-bold text-slate-800 mb-2'>
//                 Merge Data
//               </h3>

//               <p className='text-sm text-slate-500 mb-4'>
//                 Combines parallel scrapes
//               </p>

//               <div className='bg-slate-50 p-3 rounded border border-slate-200 text-xs font-mono text-slate-600'>
//                 Mode: Combine
//                 <br />
//                 Wait for all branches
//               </div>
//             </div>

//             <div className='bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500 relative'>
//               <div className='absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow'>
//                 5
//               </div>

//               <h3 className='text-xl font-bold text-slate-800 mb-2'>
//                 Edit Fields
//               </h3>

//               <p className='text-sm text-slate-500 mb-4'>
//                 Type casting & remapping
//               </p>

//               <div className='bg-slate-50 p-3 rounded border border-slate-200 text-[10px] font-mono text-slate-600 leading-relaxed overflow-hidden whitespace-pre-wrap break-words'>
//                 <div className='mb-1'>
//                   <strong className='text-blue-700'>InterestRate:</strong>
//                   <br />
//                   Number($node["Interest Rate"].json["Last"])
//                 </div>

//                 <div className='mb-1'>
//                   <strong className='text-blue-700'>InflationRate:</strong>
//                   <br />
//                   Number($node["Inflation"].json["Last"])
//                 </div>

//                 <div>
//                   <strong className='text-blue-700'>Date:</strong>
//                   <br />
//                   $now.format("dd.MM.yyyy")
//                 </div>
//               </div>
//             </div>

//             <div className='bg-white p-6 rounded-xl shadow-md border-t-4 border-amber-500 relative'>
//               <div className='absolute -top-3 -right-3 bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow'>
//                 6
//               </div>

//               <h3 className='text-xl font-bold text-slate-800 mb-2'>
//                 Sheets (Get)
//               </h3>

//               <p className='text-sm text-slate-500 mb-4'>
//                 Retrieves the last recorded row
//               </p>

//               <div className='bg-slate-50 p-3 rounded border border-slate-200 text-xs font-mono text-slate-600'>
//                 Limit: 1<br />
//                 Sort: Date (Descending)
//               </div>
//             </div>
//           </div>

//           <div className='hidden md:block h-8 border-l-2 border-dashed border-slate-300 mx-auto w-0 my-4'></div>
//         </section>

//         {/* Phase 3: Change Detection Logic */}

//         <section className='mb-16'>
//           <div className='text-center mb-10'>
//             <span className='bg-purple-100 text-purple-800 text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wide'>
//               Phase 3
//             </span>

//             <h2 className='text-3xl font-bold text-slate-800 mt-2'>
//               Change Detection Logic
//             </h2>
//           </div>

//           <div className='flex flex-col items-center'>
//             <div className='relative bg-slate-900 text-white p-8 rounded-xl shadow-xl max-w-2xl w-full text-center border-4 border-slate-200'>
//               <h3 className='text-2xl font-mono font-bold text-green-400 mb-6'>
//                 &lt;IF /&gt; Node
//               </h3>

//               <div className='grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6'>
//                 <div className='bg-slate-800 p-3 rounded border border-slate-700'>
//                   <div className='text-xs text-slate-400'>Input A (Web)</div>

//                   <div className='font-bold text-blue-400'>5.00</div>
//                 </div>

//                 <div className='font-bold text-xl text-white'>!=</div>

//                 <div className='bg-slate-800 p-3 rounded border border-slate-700'>
//                   <div className='text-xs text-slate-400'>Input B (Sheet)</div>

//                   <div className='font-bold text-amber-400'>6.00</div>
//                 </div>
//               </div>

//               <div className='text-sm font-mono text-slate-300 bg-slate-800 p-4 rounded inline-block'>
//                 (New_Rate != Old_Rate){' '}
//                 <span className='text-pink-500 font-bold'>OR</span> (New_Inf !=
//                 Old_Inf)
//               </div>

//               <div className='absolute -bottom-6 left-1/4 transform -translate-x-1/2'>
//                 <div className='bg-red-500 text-white text-xs font-bold px-3 py-1 rounded shadow'>
//                   FALSE
//                 </div>
//               </div>

//               <div className='absolute -bottom-6 right-1/4 transform -translate-x-1/2'>
//                 <div className='bg-green-500 text-white text-xs font-bold px-3 py-1 rounded shadow'>
//                   TRUE
//                 </div>
//               </div>
//             </div>

//             <div className='grid grid-cols-2 gap-8 w-full max-w-2xl mt-12'>
//               <div className='text-center opacity-50'>
//                 <div className='h-8 border-l-2 border-red-300 mx-auto mb-2'></div>

//                 <h4 className='font-bold text-slate-500'>Stop Workflow</h4>
//               </div>

//               <div className='text-center'>
//                 <div className='h-8 border-l-2 border-green-500 mx-auto mb-2'></div>

//                 <h4 className='font-bold text-green-600'>Proceed to Action</h4>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Phase 4: Action & Alerting */}

//         <section className='mb-16'>
//           <div className='text-center mb-12'>
//             <span className='bg-emerald-100 text-emerald-800 text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wide'>
//               Phase 4
//             </span>

//             <h2 className='text-3xl font-bold text-slate-800 mt-2'>
//               Persistence & Notification
//             </h2>

//             <p className='text-slate-500 mt-2'>
//               Closing the loop by recording history and notifying stakeholders.
//             </p>
//           </div>

//           <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
//             {/* Google Sheets Card */}

//             <div className='group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden'>
//               <div className='bg-emerald-600 p-5 text-white flex items-center justify-between'>
//                 <div className='flex items-center space-x-3'>
//                   <span className='text-2xl'>📈</span>

//                   <h3 className='font-bold text-lg tracking-tight'>
//                     1. Append Row (Google Sheets)
//                   </h3>
//                 </div>

//                 <span className='text-xs font-mono bg-emerald-700 px-2 py-1 rounded uppercase'>
//                   Persistence
//                 </span>
//               </div>

//               <div className='p-8'>
//                 <p className='text-slate-600 text-sm mb-6 leading-relaxed'>
//                   The workflow adds a new row to the tracking spreadsheet to
//                   maintain a long-term historical audit log of rate shifts.
//                 </p>

//                 <div className='bg-slate-50 rounded-xl p-4 border border-slate-200 relative'>
//                   <div className='flex items-center space-x-2 mb-3'>
//                     <div className='w-3 h-3 rounded-full bg-red-400'></div>

//                     <div className='w-3 h-3 rounded-full bg-amber-400'></div>

//                     <div className='w-3 h-3 rounded-full bg-emerald-400'></div>
//                   </div>

//                   <div className='overflow-x-auto'>
//                     <table className='w-full text-left text-xs'>
//                       <thead className='text-slate-400 uppercase tracking-widest border-b border-slate-200'>
//                         <tr>
//                           <th className='pb-2 font-medium'>Timestamp</th>

//                           <th className='pb-2 font-medium'>Base Rate</th>

//                           <th className='pb-2 font-medium'>Inflation</th>
//                         </tr>
//                       </thead>

//                       <tbody className='text-slate-700'>
//                         <tr className='group-hover:bg-emerald-50 transition-colors'>
//                           <td className='py-3'>21.01.2026</td>

//                           <td className='py-3 font-semibold text-emerald-600'>
//                             5.00%
//                           </td>

//                           <td className='py-3 font-semibold'>6.80%</td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Gmail Notification Card */}

//             <div className='group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden'>
//               <div className='bg-blue-600 p-5 text-white flex items-center justify-between'>
//                 <div className='flex items-center space-x-3'>
//                   <span className='text-2xl'>✉️</span>

//                   <h3 className='font-bold text-lg tracking-tight'>
//                     2. Alert Notification (Gmail)
//                   </h3>
//                 </div>

//                 <span className='text-xs font-mono bg-blue-700 px-2 py-1 rounded uppercase'>
//                   Real-Time
//                 </span>
//               </div>

//               <div className='p-8'>
//                 <p className='text-slate-600 text-sm mb-6 leading-relaxed'>
//                   An automated email is dispatched to specified recipients with
//                   the updated data and quick links for analysis.
//                 </p>

//                 <div className='bg-white border-2 border-slate-100 rounded-xl shadow-inner p-5 relative overflow-hidden'>
//                   <div className='absolute top-0 right-0 w-16 h-16 bg-blue-50 -mr-8 -mt-8 rounded-full opacity-50'></div>

//                   <div className='text-xs font-bold text-slate-800 mb-1'>
//                     Subject: 🚨 Rate Change Detected
//                   </div>

//                   <div className='text-[10px] text-slate-400 mb-4 border-b pb-2'>
//                     From: n8n Automator &lt;no-reply@work.flow&gt;
//                   </div>

//                   <div className='space-y-2'>
//                     <div className='h-2 w-3/4 bg-slate-100 rounded'></div>

//                     <div className='h-2 w-full bg-slate-100 rounded'></div>

//                     <div className='p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg'>
//                       <div className='text-[10px] font-bold text-blue-900 mb-1'>
//                         NEW INTEREST RATE: 5.00%
//                       </div>

//                       <div className='text-[9px] text-blue-700'>
//                         Previous: 6.00% ( -1.00% Drop )
//                       </div>
//                     </div>

//                     <div className='mt-4 flex space-x-2'>
//                       <div className='px-2 py-1 bg-blue-600 text-[8px] text-white rounded'>
//                         View Dashboard
//                       </div>

//                       <div className='px-2 py-1 bg-slate-200 text-[8px] text-slate-600 rounded'>
//                         Source Data
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         <footer className='text-center text-slate-400 text-sm mt-12 border-t pt-8'>
//           <p>Generated based on n8n Workflow Architecture Documentation.</p>
//         </footer>
//       </main>
//     </>
//   );
// }
