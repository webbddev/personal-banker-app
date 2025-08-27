// import { create } from 'zustand';
// import { createJSONStorage, devtools, persist } from 'zustand/middleware';
// import { FinancialInstrument } from '@/types/investment-schema';
// import {
//   calculateCurrencyTotals,
//   calculateMonthlyReturns,
//   CurrencyTotals,
// } from '@/utils/investment-calculations';
// import investmentsData from '@/data/investments-data';

// type InvestmentState = {
//   // State
//   investments: FinancialInstrument[];
//   selectedInvestment: FinancialInstrument | null;
//   openDialog: boolean;
//   isLoading: boolean;
//   currencyTotals: CurrencyTotals;
//   monthlyReturns: CurrencyTotals;

//   // Actions
//   setOpenDialog: (open: boolean) => void;
//   setSelectedInvestment: (investment: FinancialInstrument | null) => void;
//   addInvestment: (
//     investment: FinancialInstrument
//   ) => Promise<{ success: boolean }>;
//   updateInvestment: (
//     id: string,
//     updatedInvestment: FinancialInstrument
//   ) => Promise<{ success: boolean }>;
//   deleteInvestment: (id: string) => Promise<{ success: boolean }>;
//   reset: () => void;
// };

// const emptyTotals: CurrencyTotals = {
//   MDL: 0,
//   EUR: 0,
//   GBP: 0,
//   USD: 0,
// };

// const initialState = {
//   // investments: [],
//   investments: investmentsData,
//   selectedInvestment: null,
//   openDialog: false,
//   isLoading: false,
//   currencyTotals: emptyTotals,
//   monthlyReturns: emptyTotals,
// };

// // Create the store - useInvestmentStore
// export const useInvestmentStore = create<InvestmentState>()(
//   devtools(
//     persist(
//       (set, get) => ({
//         ...initialState,

//         setOpenDialog: (open) => set({ openDialog: open }),

//         setSelectedInvestment: (investment) =>
//           set({ selectedInvestment: investment }),

//         // Add a new investment
//         addInvestment: async (investment) => {
//           set({ isLoading: true });
//           try {
//             // Simulate API call delay
//             await new Promise((resolve) => setTimeout(resolve, 500));

//             // const newInvestments = [...get().investments, investment];
//             const investmentsData = [...get().investments, investment];
//             set({
//               // investments: newInvestments,
//               // currencyTotals: calculateCurrencyTotals(newInvestments),
//               // monthlyReturns: calculateMonthlyReturns(newInvestments),
//               investments: investmentsData,
//               currencyTotals: calculateCurrencyTotals(investmentsData),
//               monthlyReturns: calculateMonthlyReturns(investmentsData),
//             });

//             return { success: true };
//           } catch (error) {
//             console.error('Failed to add investment:', error);
//             return { success: false };
//           } finally {
//             set({ isLoading: false });
//           }
//         },

//         // Update an existing investment
//         updateInvestment: async (id, updatedInvestment) => {
//           set({ isLoading: true });
//           try {
//             await new Promise((resolve) => setTimeout(resolve, 500)); // Имитация запроса к API

//             // Получаем текущие инвестиции и обновляем нужную
//             const newInvestments = get().investments.map((inv) =>
//               inv.id === id ? updatedInvestment : inv
//             );

//             // Обновляем состояние
//             set({
//               investments: newInvestments,
//               currencyTotals: calculateCurrencyTotals(newInvestments),
//               monthlyReturns: calculateMonthlyReturns(newInvestments),
//             });

//             return { success: true };
//           } catch (error) {
//             console.error('Failed to update investment:', error);
//             return { success: false };
//           } finally {
//             // Снимаем флаг загрузки в любом случае
//             set({
//               isLoading: false,
//               selectedInvestment: null,
//               openDialog: false,
//             });
//           }
//         },

//         // Delete an investment
//         deleteInvestment: async (id) => {
//           set({ isLoading: true });
//           try {
//             // Simulate API call delay
//             await new Promise((resolve) => setTimeout(resolve, 500));

//             const newInvestments = get().investments.filter(
//               (inv) => inv.id !== id
//             );

//             set({
//               investments: newInvestments,
//               currencyTotals: calculateCurrencyTotals(newInvestments),
//               monthlyReturns: calculateMonthlyReturns(newInvestments),
//             });

//             return { success: true };
//           } catch (error) {
//             console.error('Failed to delete investment:', error);
//             return { success: false };
//           } finally {
//             set({
//               isLoading: false,
//               selectedInvestment: null,
//               openDialog: false,
//             });
//           }
//         },

//         reset: () => set(initialState),
//       }),
//       // Persist config - will be removed once prisma orm is implemented
//       {
//         name: 'investment-store',
//         storage: createJSONStorage(() => localStorage),
//         partialize: (state) => ({
//           investments: state.investments,
//         }),
//         onRehydrateStorage: () => (state) => {
//           if (state) {
//             // Recalculate totals after rehydration
//             const investments = state.investments;
//             state.currencyTotals = calculateCurrencyTotals(investments);
//             state.monthlyReturns = calculateMonthlyReturns(investments);
//           }
//         },
//       }
//     )
//   )
// );

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { FinancialInstrument } from '@/types/investment-schema';

type InvestmentState = {
  // UI State - only keep what's needed for UI interactions
  selectedInvestment: FinancialInstrument | null;
  openDialog: boolean;

  // Actions
  setOpenDialog: (open: boolean) => void;
  setSelectedInvestment: (investment: FinancialInstrument | null) => void;
  reset: () => void;
};

const initialState = {
  selectedInvestment: null,
  openDialog: false,
};

// Simplified store - only for UI state management
// Data management is now handled by server actions and Prisma
export const useInvestmentStore = create<InvestmentState>()(
  devtools(
    (set) => ({
      ...initialState,

      setOpenDialog: (open) => set({ openDialog: open }),

      setSelectedInvestment: (investment) =>
        set({ selectedInvestment: investment }),

      reset: () => set(initialState),
    }),
    {
      name: 'investment-ui-store', // Renamed to reflect its purpose
    }
  )
);