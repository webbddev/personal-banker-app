import { getInitialSimulatorData } from '@/app/actions/simulatorActions';
import WealthGrowthClient from './WealthGrowthClient';

export const metadata = {
  title: 'Wealth Growth Simulator | Personal Banker App',
  description: 'Project your financial future and plan your path to financial independence.',
};

export default async function WealthGrowthPage() {
  const { 
    totalCapital, 
    capitalBreakdown,
    currentMonthlyReturns, 
    monthlyReturnsBreakdown,
    exchangeRates 
  } = await getInitialSimulatorData();

  return (
    <WealthGrowthClient
      initialCapital={totalCapital}
      capitalBreakdown={capitalBreakdown || { MDL: 0, EUR: 0, GBP: 0, USD: 0 }}
      currentMonthlyReturns={currentMonthlyReturns || 0}
      monthlyReturnsBreakdown={monthlyReturnsBreakdown || { MDL: 0, EUR: 0, GBP: 0, USD: 0 }}
      exchangeRates={exchangeRates || { MDL: 1, EUR: 1, GBP: 1, USD: 1 }}
    />
  );
}
