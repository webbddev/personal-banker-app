export const INVESTMENT_TYPES = {
  BANK_DEPOSIT: 'bankDeposit',
  GOVERNMENT_BOND: 'governmentBond',
  CORPORATE_BOND: 'corporateBond',
  EVMS: 'eVMS',
} as const;

export type InvestmentType = keyof typeof INVESTMENT_TYPES;

export const investmentTypeOptions = [
  { value: INVESTMENT_TYPES.BANK_DEPOSIT, label: 'Bank Deposit' },
  { value: INVESTMENT_TYPES.GOVERNMENT_BOND, label: 'Government Bond' },
  { value: INVESTMENT_TYPES.CORPORATE_BOND, label: 'Corporate Bond' },
  { value: INVESTMENT_TYPES.EVMS, label: 'eVMS' },
] as const;

export const investmentValidationRules = {
  MIN_ORGANIZATION_LENGTH: 2,
  MAX_INTEREST_RATE: 30,
  MIN_INTEREST_RATE: 0,
} as const;
