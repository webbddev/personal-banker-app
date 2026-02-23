# Wealth Growth Simulator Design Document

**Date:** 2026-02-23
**Status:** Approved
**Topic:** Interactive Wealth Projection & Strategy Dashboard

## 1. Overview
The Wealth Growth Simulator is an interactive dashboard within the Personal Banker App that allows users to project their financial future. It bridges real database data (current investments) with hypothetical scenarios (monthly savings, interest rates) to visualize the path to financial independence.

## 2. Requirements
- **Server Integration:** Automatically aggregate current active investments as the default "Starting Capital".
- **Dynamic Simulation:** Real-time updates to charts and tables as inputs change.
- **Financial Metrics:** Track "Passive Income vs Expenses" crossover points.
- **Inflation Adjustment:** Visualize both nominal and real (purchasing power) growth.
- **Currency selection:** Allow users to select their currency (e.g., USD, EUR, GBP) and convert all values to that currency.

## 3. UI/UX Design

### Dashboard Components
1. **Parameter Sidebar:**
   - **Starting Capital:** Numeric input with a "Sync with DB" toggle.
   - **Monthly Income:** Current monthly earnings.
   - **Monthly Expenses:** Current monthly spending.
   - **Annual Return (%):** Expected growth rate.
   - **Inflation Rate (%):** Annual discount factor (also increases expenses).
   - **Investment Horizon:** Slider/Number for years (1 to 50).
   - **Monthly Expenses:** To calculate the financial freedom threshold.

2. **Visual Analytics Area:**
   - **Growth Chart (Recharts):** Multi-line chart showing Total Wealth (Nominal vs Inflation-Adjusted).
   - **Result Cards:** Summary of Total Wealth, Cumulative Interest, and Final Passive Income.
   - **Freedom Progress:** A progress bar or gauge showing % of expenses covered by projected interest.

3. **Breakdown Table:**
   - Year-by-year breakdown: `Year`, `Contribution`, `Interest`, `Total Wealth`, `Passive Income`.

## 4. Technical Architecture
- **Route:** `app/(dashboard)/wealth-growth/page.tsx`
- **Data Layer:** Uses `lib/prisma.ts` to aggregate `Investment` amounts for the logged-in user.
- **State Management:** React `useState` for simulator parameters; all calculations performed client-side for instant feedback.
- **Charting:** `recharts` (standard project library).
- **Styling:** Tailwind CSS + Shadcn UI components.

## 5. Success Criteria
- [ ] Users can see their real investment total as the starting point.
- [ ] Graphs update smoothly without page refreshes.
- [ ] The crossover point between passive income and expenses is clearly visualized.
- [ ] Inflation-adjusted values provide a realistic view of future wealth.
