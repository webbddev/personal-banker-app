import * as z from 'zod';
import {
  InvestmentType,
  INVESTMENT_TYPES,
  INVESTMENT_VALIDATION,
} from '@/utils/investment-constants';
import {
  SupportedCurrency,
  SUPPORTED_CURRENCIES,
} from '@/utils/currency-formatter';

// Financial Instrument data type
export type FinancialInstrument = {
  id: string;
  organisationName: string;
  relatedData: string;
  investmentType: InvestmentType;
  currency: SupportedCurrency;
  investmentAmount: number;
  interestRate: number;
  incomeTax: number;
  expirationDate: Date;
  // monthlyReturn: number;
  expirationStatus: 'expiring < 3 months' | 'expiring in a month' | 'expired';
};

// Form validation schema
export const formSchema = z.object({
  organisationName: z.string().refine((val) => {
    return val.trim().length >= INVESTMENT_VALIDATION.MIN_ORGANISATION_LENGTH;
  }, 'Organisation name must be at least 2 characters'),
  investmentType: z.enum(
    Object.values(INVESTMENT_TYPES) as [string, ...string[]],
    {
      required_error: 'Please select an investment type',
    }
  ),
  relatedData: z.string().optional(),
  currency: z.enum(
    Object.values(SUPPORTED_CURRENCIES) as [string, ...string[]],
    {
      required_error: 'Please select a currency',
    }
  ),
  investmentAmount: z.string().refine((val) => {
    const parsed = parseFloat(val);
    return !isNaN(parsed) && parsed > 0;
  }, 'Amount must be a valid number greater than 0'),
  incomeTax: z.string().refine((val) => {
    const parsed = parseFloat(val);
    return !isNaN(parsed) && parsed >= 0 && parsed <= 50;
  }, 'Income tax must be a valid percentage between 0 and 50'),
  interestRate: z.string().refine((val) => {
    const parsed = parseFloat(val);
    return (
      !isNaN(parsed) &&
      parsed >= INVESTMENT_VALIDATION.MIN_INTEREST_RATE &&
      parsed <= INVESTMENT_VALIDATION.MAX_INTEREST_RATE
    );
  }, 'Interest rate must be between 0 and 30%'),
  expirationDate: z.coerce
    .date()
    .refine(
      (date) => date > new Date(),
      'Expiration date must be in the future'
    ),
});

// Form type derived from the schema
export type CreateInvestmentFormValues = z.infer<typeof formSchema>;
