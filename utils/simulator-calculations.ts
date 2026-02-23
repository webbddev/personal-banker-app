/**
 * Wealth Growth Simulator Calculation Logic
 */

export interface ProjectionPoint {
  year: number;
  nominalTotal: number;
  realTotal: number;
  passiveIncome: number;
  totalContributions: number;
  totalInterest: number;
}

export interface SimulationParams {
  startingCapital: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  annualReturnRate: number; // e.g., 5 for 5%
  inflationRate: number; // e.g., 2 for 2%
  years: number;
}

/**
 * Calculates the investment projection based on monthly compounding
 */
export function calculateProjection(params: SimulationParams): ProjectionPoint[] {
  const {
    startingCapital,
    monthlyIncome,
    monthlyExpenses,
    annualReturnRate,
    inflationRate,
    years,
  } = params;

  const projection: ProjectionPoint[] = [];
  const monthlyReturnRate = annualReturnRate / 100 / 12;

  let currentNominal = startingCapital;
  let currentReal = startingCapital;
  let totalContributions = startingCapital;
  let totalInterest = 0;
  let currentMonthlyExpenses = monthlyExpenses;

  // Year 0 (Starting Point)
  projection.push({
    year: 0,
    nominalTotal: Math.round(currentNominal),
    realTotal: Math.round(currentReal),
    passiveIncome: Math.round((currentNominal * (annualReturnRate / 100)) / 12),
    totalContributions: Math.round(totalContributions),
    totalInterest: Math.round(totalInterest),
  });

  for (let year = 1; year <= years; year++) {
    // Increase expenses by inflation at the start of each year (starting from Year 2 in simulation)
    // Or apply it monthly. Poformule says "every year increases your expenses".
    if (year > 1) {
      currentMonthlyExpenses *= (1 + inflationRate / 100);
    }

    for (let month = 1; month <= 12; month++) {
      // 1. Add monthly return (Interest)
      const interestEarned = currentNominal * monthlyReturnRate;
      currentNominal += interestEarned;
      totalInterest += interestEarned;

      // 2. Add monthly net contribution (Income - Expenses)
      const netMonthlyContribution = monthlyIncome - currentMonthlyExpenses;
      currentNominal += netMonthlyContribution;
      totalContributions += netMonthlyContribution;
    }

    // After 12 months, record the yearly snapshot
    // Real Value = Nominal Value discounted by inflation
    currentReal = currentNominal / Math.pow(1 + inflationRate / 100, year);

    projection.push({
      year,
      nominalTotal: Math.round(currentNominal),
      realTotal: Math.round(currentReal),
      passiveIncome: Math.round((currentNominal * (annualReturnRate / 100)) / 12),
      totalContributions: Math.round(totalContributions),
      totalInterest: Math.round(totalInterest),
    });
  }

  return projection;
}
