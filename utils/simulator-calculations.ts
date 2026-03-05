export interface ProjectionPoint {
  year: number;
  nominalTotal: number;
  realTotal: number;
  passiveIncome: number;
  totalContributions: number;
  totalInterest: number;
}

export interface OneTimeEvent {
  id: string;
  description: string;
  amount: number; // Positive for income, negative for expense
  year: number;
  month?: number; // 1-12, optional (defaults to month 1)
}

export interface SimulationParams {
  startingCapital: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  annualReturnRate: number; // e.g., 5 for 5%
  inflationRate: number; // e.g., 2 for 2%
  incomeGrowthRate: number; // e.g., 3 for 3% annual growth
  taxRate: number; // e.g., 10 for 10% tax on interest
  years: number;
  oneTimeEvents: OneTimeEvent[];
}

/**
 * Calculates the investment projection based on monthly compounding
 */
export function calculateProjection(
  params: SimulationParams,
): ProjectionPoint[] {
  const {
    startingCapital,
    monthlyIncome,
    monthlyExpenses,
    annualReturnRate,
    inflationRate,
    incomeGrowthRate,
    taxRate,
    years,
    oneTimeEvents = [],
  } = params;

  const projection: ProjectionPoint[] = [];
  const monthlyReturnRate = annualReturnRate / 100 / 12;

  let currentNominal = startingCapital;
  let currentReal = startingCapital;
  let totalContributions = startingCapital;
  let totalInterest = 0;
  let currentMonthlyIncome = monthlyIncome;
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
    // Annual Adjustments (Inflation and Income Growth)
    if (year > 1) {
      currentMonthlyExpenses *= 1 + inflationRate / 100;
      currentMonthlyIncome *= 1 + incomeGrowthRate / 100;
    }

    for (let month = 1; month <= 12; month++) {
      // 1. Interest Earned (Compounding Monthly)
      const interestEarned = currentNominal * monthlyReturnRate;
      const afterTaxInterest = interestEarned * (1 - taxRate / 100);

      currentNominal += afterTaxInterest;
      totalInterest += afterTaxInterest;

      // 2. Net Contributions (Income - Expenses)
      const netMonthlyContribution =
        currentMonthlyIncome - currentMonthlyExpenses;
      currentNominal += netMonthlyContribution;
      totalContributions += netMonthlyContribution;

      // 3. Handle One-Time Events for this specific year and month
      const eventsThisMonth = oneTimeEvents.filter(
        (e) =>
          e.year === year && (e.month === month || (!e.month && month === 1)),
      );

      for (const event of eventsThisMonth) {
        currentNominal += event.amount;
        totalContributions += event.amount;
      }
    }

    // Record the yearly snapshot
    // Real Value = Nominal Value discounted by inflation from ALL prior years
    currentReal = currentNominal / Math.pow(1 + inflationRate / 100, year);

    projection.push({
      year,
      nominalTotal: Math.round(currentNominal),
      realTotal: Math.round(currentReal),
      passiveIncome: Math.round(
        (currentNominal * (annualReturnRate / 100)) / 12,
      ),
      totalContributions: Math.round(totalContributions),
      totalInterest: Math.round(totalInterest),
    });
  }

  return projection;
}
