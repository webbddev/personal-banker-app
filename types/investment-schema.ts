import * as z from 'zod';
import {
  INVESTMENT_TYPES,
  investmentValidationRules,
} from '@/utils/investment-constants';
import { SUPPORTED_CURRENCY_LABELS } from '@/utils/currency-formatter';
import { Investment } from '@/prisma/generated/prisma/client.js';
// ✅ Import from Prisma's generated enums instead of custom file
import { ExpirationStatus } from '@/prisma/generated/prisma/enums.js';

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

  investmentAmount: z.number().positive('Amount must be greater than 0'),

  incomeTax: z
    .number()
    .min(0, 'Income tax cannot be negative')
    .max(
      investmentValidationRules.MAX_INCOME_TAX,
      `Income tax must be between ${investmentValidationRules.MIN_INCOME_TAX} and ${investmentValidationRules.MAX_INCOME_TAX}`
    ),

  interestRate: z
    .number()
    .min(investmentValidationRules.MIN_INTEREST_RATE)
    .max(
      investmentValidationRules.MAX_INTEREST_RATE,
      `Interest rate must be between ${investmentValidationRules.MIN_INTEREST_RATE} and ${investmentValidationRules.MAX_INTEREST_RATE}%`
    ),

  expirationDate: z.date().refine((date) => date > new Date(), {
    message: 'Expiration date must be in the future',
  }),
});

// Form type derived from the schema
export type CreateInvestmentFormValues = z.infer<typeof formSchema>;

// Re-export Prisma types for convenience
export type { Investment };
export { ExpirationStatus };
