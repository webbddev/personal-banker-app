// import { FinancialInstrument } from '@/types/investment-schema';
// import { InvestmentType, INVESTMENT_TYPES } from '@/utils/investment-constants';
// import { SupportedCurrencyCode } from '@/utils/currency-formatter';

// // Type for Prisma investment data
// type PrismaInvestment = {
//   id: string;
//   organisationName: string;
//   relatedData: string | null;
//   investmentType: string;
//   currency: string;
//   investmentAmount: number;
//   interestRate: number;
//   incomeTax: number;
//   expirationDate: Date;
//   expirationStatus: any; // ExpirationStatus from Prisma
//   createdAt: Date;
//   updatedAt: Date;
// };

// /**
//  * Transforms Prisma investment data to FinancialInstrument type
//  */
// export function transformPrismaInvestmentToFinancialInstrument(
//   prismaInvestment: PrismaInvestment
// ): FinancialInstrument {
//   // Map string investment type to the expected union type
//   const investmentTypeMap: Record<string, InvestmentType> = {
//     bankDeposit: 'BANK_DEPOSIT',
//     governmentBond: 'GOVERNMENT_BOND',
//     corporateBond: 'CORPORATE_BOND',
//     eVMS: 'EVMS',
//     // Also handle if the database already stores the uppercase versions
//     BANK_DEPOSIT: 'BANK_DEPOSIT',
//     GOVERNMENT_BOND: 'GOVERNMENT_BOND',
//     CORPORATE_BOND: 'CORPORATE_BOND',
//     EVMS: 'EVMS',
//   };

//   const mappedInvestmentType =
//     investmentTypeMap[prismaInvestment.investmentType] || 'BANK_DEPOSIT';

//   return {
//     id: prismaInvestment.id,
//     organisationName: prismaInvestment.organisationName,
//     relatedData: prismaInvestment.relatedData,
//     investmentType: mappedInvestmentType,
//     currency: prismaInvestment.currency.toLowerCase() as SupportedCurrencyCode,
//     investmentAmount: prismaInvestment.investmentAmount,
//     interestRate: prismaInvestment.interestRate,
//     incomeTax: prismaInvestment.incomeTax,
//     expirationDate: prismaInvestment.expirationDate,
//     expirationStatus: prismaInvestment.expirationStatus,
//     createdAt: prismaInvestment.createdAt,
//     updatedAt: prismaInvestment.updatedAt,
//   };
// }

// /**
//  * Transforms an array of Prisma investments to FinancialInstrument array
//  */
// export function transformPrismaInvestmentsToFinancialInstruments(
//   prismaInvestments: PrismaInvestment[]
// ): FinancialInstrument[] {
//   return prismaInvestments.map(transformPrismaInvestmentToFinancialInstrument);
// }
