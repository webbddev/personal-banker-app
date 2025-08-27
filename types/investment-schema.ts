import * as z from 'zod';
import {
  INVESTMENT_TYPES,
  investmentValidationRules,
} from '@/utils/investment-constants';
import { SUPPORTED_CURRENCY_LABELS } from '@/utils/currency-formatter';
import { Investment } from '@/lib/generated/prisma';

// Use Prisma's generated Investment type as the main type
export type FinancialInstrument = Investment;

// Form validation schema
export const formSchema = z.object({
  organisationName: z
    .string()
    .trim()
    .min(
      investmentValidationRules.MIN_ORGANIZATION_LENGTH,
      `Organisation name must be at least ${investmentValidationRules.MIN_ORGANIZATION_LENGTH} characters`
    ),

  investmentType: z.enum(Object.values(INVESTMENT_TYPES), {
    error: 'Please select an investment type',
  }),

  relatedData: z.string().optional(),

  currency: z.enum(Object.values(SUPPORTED_CURRENCY_LABELS), {
    error: 'Please select a currency',
  }),

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
      parsed >= investmentValidationRules.MIN_INTEREST_RATE &&
      parsed <= investmentValidationRules.MAX_INTEREST_RATE
    );
  }, 'Interest rate must be between 0 and 30%'),

  expirationDate: z.date().refine((date) => date > new Date(), {
    message: 'Expiration date must be in the future',
  }),
});

// Form type derived from the schema
export type CreateInvestmentFormValues = z.infer<typeof formSchema>;

// Export Prisma types for convenience
export { ExpirationStatus, type Investment } from '@/lib/generated/prisma';
