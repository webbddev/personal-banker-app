import { getInitialSimulatorData } from '@/app/actions/simulatorActions';
import WealthGrowthClient from './WealthGrowthClient';

export const metadata = {
  title: 'Wealth Growth Simulator | Personal Banker App',
  description: 'Project your financial future and plan your path to financial independence.',
};

export default async function WealthGrowthPage() {
  const { totalCapital, exchangeRates } = await getInitialSimulatorData();

  return (
    <WealthGrowthClient
      initialCapital={totalCapital}
      exchangeRates={exchangeRates || { MDL: 1, EUR: 1, GBP: 1, USD: 1 }}
    />
  );
}
