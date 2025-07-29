import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { FinancialInstrument } from '@/types/investment-schema';
import {
  calculateCurrencyTotals,
  calculateMonthlyReturns,
  CurrencyTotals,
} from '@/utils/investment-calculations';
import investmentsData from '@/data/investments-data';


type InvestmentState = {
  // State
  investments: FinancialInstrument[];
  selectedInvestment: FinancialInstrument | null;
  openDialog: boolean;
  isLoading: boolean;
  currencyTotals: CurrencyTotals;
  monthlyReturns: CurrencyTotals;

  // Actions
  setOpenDialog: (open: boolean) => void;
  setSelectedInvestment: (investment: FinancialInstrument | null) => void;
  addInvestment: (
    investment: FinancialInstrument
  ) => Promise<{ success: boolean }>;
  updateInvestment: (
    id: string,
    updatedInvestment: FinancialInstrument
  ) => Promise<{ success: boolean }>;
  deleteInvestment: (id: string) => Promise<{ success: boolean }>;
  reset: () => void;
};

const emptyTotals: CurrencyTotals = {
  MDL: 0,
  EUR: 0,
  GBP: 0,
};

const initialState = {
  // investments: [],
  investments: investmentsData,
  selectedInvestment: null,
  openDialog: false,
  isLoading: false,
  currencyTotals: emptyTotals,
  monthlyReturns: emptyTotals,
};

export const useInvestmentStore = create<InvestmentState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setOpenDialog: (open) => set({ openDialog: open }),

        setSelectedInvestment: (investment) =>
          set({ selectedInvestment: investment }),

        addInvestment: async (investment) => {
          set({ isLoading: true });
          try {
            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            // const newInvestments = [...get().investments, investment];
            const investmentsData = [...get().investments, investment];
            set({
              // investments: newInvestments,
              // currencyTotals: calculateCurrencyTotals(newInvestments),
              // monthlyReturns: calculateMonthlyReturns(newInvestments),
              investments: investmentsData,
              currencyTotals: calculateCurrencyTotals(investmentsData),
              monthlyReturns: calculateMonthlyReturns(investmentsData),
            });

            return { success: true };
          } catch (error) {
            console.error('Failed to add investment:', error);
            return { success: false };
          } finally {
            set({ isLoading: false });
          }
        },

        updateInvestment: async (id, updatedInvestment) => {
          set({ isLoading: true });
          try {
            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            const newInvestments = get().investments.map((inv) =>
              inv.id === id ? updatedInvestment : inv
            );

            set({
              investments: newInvestments,
              currencyTotals: calculateCurrencyTotals(newInvestments),
              monthlyReturns: calculateMonthlyReturns(newInvestments),
            });

            return { success: true };
          } catch (error) {
            console.error('Failed to update investment:', error);
            return { success: false };
          } finally {
            set({
              isLoading: false,
              selectedInvestment: null,
              openDialog: false,
            });
          }
        },

        deleteInvestment: async (id) => {
          set({ isLoading: true });
          try {
            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            const  newInvestments = get().investments.filter(
              (inv) => inv.id !== id
            );

            set({
              investments: newInvestments,
              currencyTotals: calculateCurrencyTotals(newInvestments),
              monthlyReturns: calculateMonthlyReturns(newInvestments),
            });

            return { success: true };
          } catch (error) {
            console.error('Failed to delete investment:', error);
            return { success: false };
          } finally {
            set({
              isLoading: false,
              selectedInvestment: null,
              openDialog: false,
            });
          }
        },

        reset: () => set(initialState),
      }),
      {
        name: 'investment-store',
        partialize: (state) => ({
          investments: state.investments,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Recalculate totals after rehydration
            const investments = state.investments;
            state.currencyTotals = calculateCurrencyTotals(investments);
            state.monthlyReturns = calculateMonthlyReturns(investments);
          }
        },
      }
    )
  )
);
