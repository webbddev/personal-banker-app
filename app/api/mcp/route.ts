import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { verifyToken } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import {
  calculateMonthlyReturn,
  calculateDaysUntilExpiration,
} from '@/utils/investment-calculations';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, mcp-session-id',
  'Access-Control-Expose-Headers': 'WWW-Authenticate, mcp-session-id',
};

const TYPE_LABELS: Record<string, string> = {
  bankDeposit: 'Bank Deposit',
  governmentBond: 'Government Bond',
  corporateBond: 'Corporate Bond',
  eVMS: 'eVMS (Treasury)',
  realEstate: 'Real Estate / Rental Property',
};

function formatAmount(amount: number, currency: string): string {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
}

function formatReturn(amount: number, currency: string): string {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}/mo`;
}

function formatDateFriendly(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Creates and registers voice-optimized MCP tools scoped to the authenticated user.
 */
function createMcpServer(userId: string): McpServer {
  const server = new McpServer({
    name: 'Personal Banker MCP',
    version: '1.0.0',
  });

  // Tool 1: get_portfolio_summary
  server.tool(
    'get_portfolio_summary',
    "Provides an executive summary of the user's total investment portfolio, total invested principal, and total estimated net monthly income, broken down by currency and asset type (bank deposits, government bonds, corporate bonds, real estate). Use this when the user asks how much money they have invested, their total monthly passive income, or an overview of their assets.",
    async () => {
      const investments = await prisma.investment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      const now = new Date();
      const totalPrincipalByCurrency: Record<string, number> = {};
      const totalNetMonthlyIncomeByCurrency: Record<string, number> = {};
      const breakdownByType: Record<
        string,
        {
          label: string;
          count: number;
          totalPrincipalByCurrency: Record<string, number>;
          totalNetMonthlyIncomeByCurrency: Record<string, number>;
        }
      > = {};

      let activeCount = 0;

      for (const inv of investments) {
        const isExpired =
          inv.expirationStatus === 'EXPIRED' ||
          (inv.expirationDate && new Date(inv.expirationDate) < now);

        if (!isExpired) {
          activeCount += 1;
        }

        const curr = inv.currency || 'MDL';
        const principal = Number(inv.investmentAmount) || 0;
        const monthlyReturn = calculateMonthlyReturn(
          principal,
          Number(inv.interestRate) || 0,
          Number(inv.incomeTax) || 0,
          now,
          {
            investmentType: inv.investmentType,
            monthlyRent: inv.monthlyRent ?? undefined,
          },
        );

        // Principal totals
        totalPrincipalByCurrency[curr] =
          (totalPrincipalByCurrency[curr] || 0) + principal;

        // Income totals (only for active investments)
        if (!isExpired) {
          totalNetMonthlyIncomeByCurrency[curr] =
            (totalNetMonthlyIncomeByCurrency[curr] || 0) + monthlyReturn;
        }

        // Breakdown by asset type
        const typeKey = inv.investmentType || 'other';
        if (!breakdownByType[typeKey]) {
          breakdownByType[typeKey] = {
            label: TYPE_LABELS[typeKey] || typeKey,
            count: 0,
            totalPrincipalByCurrency: {},
            totalNetMonthlyIncomeByCurrency: {},
          };
        }

        breakdownByType[typeKey].count += 1;
        breakdownByType[typeKey].totalPrincipalByCurrency[curr] =
          (breakdownByType[typeKey].totalPrincipalByCurrency[curr] || 0) +
          principal;

        if (!isExpired) {
          breakdownByType[typeKey].totalNetMonthlyIncomeByCurrency[curr] =
            (breakdownByType[typeKey].totalNetMonthlyIncomeByCurrency[curr] ||
              0) + monthlyReturn;
        }
      }

      // Format currency breakdowns into voice-friendly executive summary
      const spokenCurrencyLines: string[] = [];
      for (const curr of Object.keys(totalPrincipalByCurrency)) {
        const principalFormatted = formatAmount(
          totalPrincipalByCurrency[curr],
          curr,
        );
        const incomeFormatted = formatReturn(
          totalNetMonthlyIncomeByCurrency[curr] || 0,
          curr,
        );
        spokenCurrencyLines.push(
          `${principalFormatted} principal generating ${incomeFormatted}`,
        );
      }

      const spokenSummary =
        investments.length === 0
          ? 'You currently have no investments in your portfolio.'
          : `You currently have ${activeCount} active investment${
              activeCount === 1 ? '' : 's'
            }. In total, you have ${spokenCurrencyLines.join(', and ')}.`;

      const summaryPayload = {
        spokenSummary,
        activeInvestmentsCount: activeCount,
        totalInvestmentsCount: investments.length,
        totalPrincipalByCurrency,
        totalNetMonthlyIncomeByCurrency,
        breakdownByType,
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(summaryPayload, null, 2),
          },
        ],
      };
    },
  );

  // Tool 2: get_investments
  server.tool(
    'get_investments',
    "Search and filter individual investments in the user's portfolio. Use when the user asks about specific assets, investments with a particular bank or issuer (e.g., 'MAIB', 'Ministry of Finance'), rental properties, or investments in a specific currency.",
    {
      investmentType: z
        .enum([
          'bankDeposit',
          'governmentBond',
          'corporateBond',
          'eVMS',
          'realEstate',
        ])
        .optional()
        .describe(
          'Filter by asset type: bankDeposit, governmentBond, corporateBond, eVMS, or realEstate',
        ),
      organisationName: z
        .string()
        .optional()
        .describe(
          "Filter by bank, issuer, or organisation name (case-insensitive partial match, e.g. 'MAIB', 'Moldova')",
        ),
      currency: z
        .string()
        .optional()
        .describe("Filter by currency code, e.g. 'MDL', 'EUR', 'USD', 'GBP'"),
      expirationStatus: z
        .enum([
          'ACTIVE',
          'EXPIRED',
          'EXPIRING_IN_A_MONTH',
          'EXPIRING_LESS_THAN_3_MONTHS',
        ])
        .optional()
        .describe(
          'Filter by status: ACTIVE, EXPIRED, EXPIRING_IN_A_MONTH, or EXPIRING_LESS_THAN_3_MONTHS',
        ),
    },
    async ({ investmentType, organisationName, currency, expirationStatus }) => {
      const whereClause: Record<string, any> = { userId };

      if (investmentType) {
        whereClause.investmentType = investmentType;
      }
      if (organisationName && organisationName.trim() !== '') {
        whereClause.organisationName = {
          contains: organisationName.trim(),
          mode: 'insensitive',
        };
      }
      if (currency && currency.trim() !== '') {
        whereClause.currency = currency.trim().toUpperCase();
      }
      if (expirationStatus) {
        whereClause.expirationStatus = expirationStatus;
      }

      const records = await prisma.investment.findMany({
        where: whereClause,
        orderBy: { expirationDate: 'asc' },
      });

      const now = new Date();
      const results = records.map((inv) => {
        const principal = Number(inv.investmentAmount) || 0;
        const interestRate = Number(inv.interestRate) || 0;
        const incomeTax = Number(inv.incomeTax) || 0;
        const monthlyReturn = calculateMonthlyReturn(
          principal,
          interestRate,
          incomeTax,
          now,
          {
            investmentType: inv.investmentType,
            monthlyRent: inv.monthlyRent ?? undefined,
          },
        );

        const expDate = new Date(inv.expirationDate);
        const daysRemaining = calculateDaysUntilExpiration(expDate);

        return {
          organisationName: inv.organisationName,
          investmentType: inv.investmentType,
          typeLabel: TYPE_LABELS[inv.investmentType] || inv.investmentType,
          currency: inv.currency,
          investmentAmount: principal,
          formattedAmount: formatAmount(principal, inv.currency),
          interestRate,
          incomeTax,
          netMonthlyReturn: monthlyReturn,
          formattedMonthlyReturn: formatReturn(monthlyReturn, inv.currency),
          expirationDateFormatted: formatDateFriendly(expDate),
          daysRemaining,
          status: inv.expirationStatus,
          ...(inv.investmentType === 'realEstate'
            ? {
                monthlyRent: inv.monthlyRent,
                propertyType: inv.propertyType,
                tenantName: inv.tenantName,
              }
            : {}),
        };
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                count: results.length,
                investments: results,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // Tool 3: get_upcoming_expirations
  server.tool(
    'get_upcoming_expirations',
    'Checks for active investments that are maturing or expiring within a specified number of days. Use when the user asks what investments are coming due, maturing soon, or expiring in the next month or quarter.',
    {
      daysAhead: z
        .number()
        .int()
        .positive()
        .default(30)
        .describe(
          'Number of days forward to check for maturing or expiring investments (default: 30)',
        ),
    },
    async ({ daysAhead }) => {
      const windowDays = daysAhead || 30;
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + windowDays);
      targetDate.setHours(23, 59, 59, 999);

      const records = await prisma.investment.findMany({
        where: {
          userId,
          expirationDate: {
            gte: now,
            lte: targetDate,
          },
          expirationStatus: {
            not: 'EXPIRED',
          },
        },
        orderBy: {
          expirationDate: 'asc',
        },
      });

      const expiringInvestments = records.map((inv) => {
        const principal = Number(inv.investmentAmount) || 0;
        const interestRate = Number(inv.interestRate) || 0;
        const incomeTax = Number(inv.incomeTax) || 0;
        const monthlyReturn = calculateMonthlyReturn(
          principal,
          interestRate,
          incomeTax,
          now,
          {
            investmentType: inv.investmentType,
            monthlyRent: inv.monthlyRent ?? undefined,
          },
        );

        const expDate = new Date(inv.expirationDate);
        const daysUntilExpiration = calculateDaysUntilExpiration(expDate);

        return {
          organisationName: inv.organisationName,
          investmentType: inv.investmentType,
          typeLabel: TYPE_LABELS[inv.investmentType] || inv.investmentType,
          currency: inv.currency,
          investmentAmount: principal,
          formattedAmount: formatAmount(principal, inv.currency),
          interestRate,
          netMonthlyReturn: monthlyReturn,
          formattedMonthlyReturn: formatReturn(monthlyReturn, inv.currency),
          expirationDateFormatted: formatDateFriendly(expDate),
          daysUntilExpiration,
        };
      });

      const spokenSummary =
        expiringInvestments.length === 0
          ? `You have no investments expiring in the next ${windowDays} days.`
          : `You have ${expiringInvestments.length} investment${
              expiringInvestments.length === 1 ? '' : 's'
            } expiring within the next ${windowDays} days: ${expiringInvestments
              .map(
                (inv) =>
                  `${inv.organisationName} (${inv.formattedAmount}) on ${inv.expirationDateFormatted} in ${inv.daysUntilExpiration} days`,
              )
              .join('; ')}.`;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                spokenSummary,
                windowDays,
                totalExpiringCount: expiringInvestments.length,
                expiringInvestments,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  return server;
}

/**
 * Handles incoming Streamable HTTP requests with Clerk Bearer verification.
 */
async function handleMcpRequest(req: Request) {
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL || 'https://personal-banker-niko.vercel.app'
  ).replace(/\/$/, '');
  const resourceMetadataUrl = `${appUrl}/.well-known/oauth-protected-resource`;

  // 1. Verify Authorization Header
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized',
        message: 'Missing or invalid Bearer token',
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': `Bearer resource_metadata="${resourceMetadataUrl}"`,
          ...corsHeaders,
        },
      },
    );
  }

  const token = authHeader.substring(7).trim();
  let userId: string;

  try {
    const verified = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    if (!verified || !verified.sub) {
      throw new Error('Token verification failed: subject missing');
    }
    userId = verified.sub;
  } catch (err) {
    console.error('MCP auth token verification error:', err);
    return new Response(
      JSON.stringify({
        error: 'Unauthorized',
        message: 'Invalid or expired access token',
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': `Bearer error="invalid_token", resource_metadata="${resourceMetadataUrl}"`,
          ...corsHeaders,
        },
      },
    );
  }

  // 2. Instantiate stateless transport and fresh server instance per request
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  const server = createMcpServer(userId);
  await server.connect(transport);

  // 3. Process the Web Standard Request
  const response = await transport.handleRequest(req);

  // 4. Merge CORS headers into response
  const responseHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders)) {
    responseHeaders.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export async function GET(req: Request) {
  return handleMcpRequest(req);
}

export async function POST(req: Request) {
  return handleMcpRequest(req);
}

export async function DELETE(req: Request) {
  return handleMcpRequest(req);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
