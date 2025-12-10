import { UIMessage, convertToModelMessages, stepCountIs, streamText } from 'ai';
import { experimental_createMCPClient as createMCPClient } from '@ai-sdk/mcp';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { NextRequest, NextResponse } from 'next/server.js';
import { checkUser } from '@/lib/checkUser.js';
import { prisma } from '@/lib/prisma.js';

export const maxDuration = 30;

// List of trusted Moldovan financial sources
const TRUSTED_MOLDOVAN_SOURCES = {
  banks: [
    'https://www.victoriabank.md/ru/economii-si-investitii/depozite-la-termen/depozit-online',
    'https://mobiasbanca.md/ru/promo-deposit',
    'https://micb.md/ru/depozite-persoane-fizice/',
    'https://ecb.md/ru/depozity-fiziceskih-lit/',
    'https://eximbank.md/ru/deposit-types',
    'https://fincombank.com/ru/tipurile-de-depozite#filter=.online',
    'https://www.energbank.com/ru/page/%D1%83%D1%81%D0%BB%D0%BE%D0%B2%D0%B8%D1%8F-%D0%B4%D0%B5%D0%BF%D0%BE%D0%B7%D0%B8%D1%82%D0%BE%D0%B2',
    'https://comertbank.md/ru/services/physical_person/deposits/',
    'https://www.procreditbank.md/ru/content/proclassic_ru',
    'https://www.maib.md/ru/persoane-fizice/depozite',
  ],
  regulators: [
    'https://bnm.md', // National Bank of Moldova
    'https://mf.gov.md', // Ministry of Finance
  ],
  financialReports: [
    'https://bnm.md/bdi/pages/reports/drsb/DRSB10.xhtml', // Bank financial reports
    'https://bnm.md/bdi/pages/reports/drsb/DRSB10.xhtml?id=0&lang=ru',
  ],
};

export async function POST(req: NextRequest) {
  let mcpClient: any = null;

  try {
    const {
      messages,
      model,
      webSearch,
    }: {
      messages: UIMessage[];
      model: string;
      webSearch: boolean;
    } = await req.json();

    const user = await checkUser();
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    // Get user investments from database via prisma
    const userInvestments = await prisma.investment.findMany({
      where: { userId: user.clerkUserId },
      select: {
        organisationName: true,
        investmentAmount: true,
        currency: true,
        interestRate: true,
        investmentType: true,
        expirationDate: true,
      },
    });

    // Format investments
    const formattedInvestments = userInvestments.map((investment) => ({
      ...investment,
      expirationDate: investment.expirationDate.toISOString().split('T')[0],
    }));

    // Helper calculations
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const thirtyDaysFromNowString = thirtyDaysFromNow
      .toISOString()
      .split('T')[0];

    // Portfolio analysis calculations
    const expired = userInvestments.filter(
      (i) => i.expirationDate && i.expirationDate < today
    );
    const active = userInvestments.filter(
      (i) => i.expirationDate && i.expirationDate >= today
    );
    const expiringSoon = userInvestments.filter((i) => {
      if (!i.expirationDate) return false;
      const daysDiff =
        (i.expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff > 0 && daysDiff <= 30;
    });

    const totalsByCurrency: Record<string, number> = {};
    userInvestments.forEach((i) => {
      if (!totalsByCurrency[i.currency]) totalsByCurrency[i.currency] = 0;
      totalsByCurrency[i.currency] += i.investmentAmount;
    });

    const maxReturn = Math.max(...userInvestments.map((i) => i.interestRate));
    const highestReturn = userInvestments.filter(
      (i) => i.interestRate === maxReturn
    );

    const portfolioSummary = {
      totalInvestments: userInvestments.length,
      totalsByCurrency,
      expired: expired.map((i) => ({
        organisation: i.organisationName,
        maturityDate: i.expirationDate?.toISOString().split('T')[0],
      })),
      active: active.map((i) => ({
        organisation: i.organisationName,
        maturityDate: i.expirationDate?.toISOString().split('T')[0],
      })),
      expiringSoon: expiringSoon.map((i) => ({
        organisation: i.organisationName,
        maturityDate: i.expirationDate?.toISOString().split('T')[0],
      })),
      highestReturn: highestReturn.map((i) => ({
        organisation: i.organisationName,
        interestRate: i.interestRate,
      })),
    };

    // Initialize tools
    let tools = {};

    if (webSearch && process.env.TAVILY_API_KEY) {
      try {
        // Use StreamableHTTPClientTransport for better compatibility
        const url = new URL('https://mcp.tavily.com/mcp/');
        url.searchParams.append('tavilyApiKey', process.env.TAVILY_API_KEY);

        mcpClient = await createMCPClient({
          transport: new StreamableHTTPClientTransport(url, {
            sessionId: `session_${Date.now()}`,
          }),
        });

        // Get available tools with schema definitions for better type safety
        const tavilyTools = await mcpClient.tools({
          schemas: {
            'tavily-search': {
              inputSchema: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description: 'Search query for web information',
                  },
                  search_depth: {
                    type: 'string',
                    enum: ['basic', 'advanced'],
                    description:
                      'Search depth - basic for quick results, advanced for comprehensive',
                    default: 'basic',
                  },
                  include_domains: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Limit search to specific domains',
                  },
                  exclude_domains: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Exclude specific domains from search',
                  },
                },
                required: ['query'],
              },
            },
            'tavily-extract': {
              inputSchema: {
                type: 'object',
                properties: {
                  urls: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'URLs to extract content from',
                  },
                },
                required: ['urls'],
              },
            },
          },
        });

        tools = tavilyTools;
        console.log('Tavily MCP tools initialized successfully');
      } catch (mcpError) {
        console.error('Failed to initialize Tavily MCP:', mcpError);
        // Fallback to basic tools if MCP fails
      }
    }

    // System prompt with Moldovan context
    const systemPrompt = `
${webSearch ? '**WEB SEARCH MODE ACTIVATED:** You have access to Tavily search tools to answer questions about general market conditions, bank deposit offers, and financial products in Moldova.' : "**PORTFOLIO ANALYSIS MODE:** Focus exclusively on analyzing the user's provided investment portfolio."}

You are a personal financial assistant specializing in investment portfolio analysis and Moldovan financial markets.

${
  webSearch
    ? `
**TRUSTED SOURCES FOR MOLDOVAN FINANCIAL INFORMATION:**
When searching for information about Moldovan banks and financial products, prioritize these official sources:

Banks:
${TRUSTED_MOLDOVAN_SOURCES.banks.join('\n')}

Regulators and Reports:
${TRUSTED_MOLDOVAN_SOURCES.regulators.join('\n')}

**SPECIAL INSTRUCTIONS FOR MOLDOVAN BANK QUERIES:**
1. When asked about specific banks' financial health or performance:
   - Use tavily-search to find information from bnm.md (National Bank of Moldova)
   - Look specifically for DRSB reports at: https://bnm.md/bdi/pages/reports/drsb/DRSB10.xhtml
   - Extract key financial indicators like assets, capital adequacy, liquidity ratios

2. When asked about best deposit rates in Moldova:
   - Search multiple bank websites for current deposit offerings
   - Compare rates across different terms (3, 6, 12, 24 months)
   - Consider both MDL and foreign currency deposits
   - Check for special online deposit rates which often offer better terms

3. For general market conditions:
   - Check bnm.md for official statistics and monetary policy
   - Look for recent news about banking sector developments
   - Consider inflation rates and their impact on real returns

**SEARCH STRATEGY:**
1. For bank-specific queries: First search "[bank name] site:bnm.md" for official reports
2. For deposit rates: Search "[bank name] депозиты процентные ставки 2025" on bank websites
3. For financial health: Use "DRSB [bank name] site:bnm.md" to find regulatory reports
4. Always verify information from multiple sources when possible
`
    : ''
}

The user's investment portfolio: ${JSON.stringify(formattedInvestments, null, 2)}
Portfolio Summary: ${JSON.stringify(portfolioSummary, null, 2)}
Current date: ${currentDate}

**CRITICAL GUIDELINES:**
1. **Query Type Determination:**
   - Portfolio queries (my deposits, my investments): Use ONLY the provided portfolio data
   - Market queries (best rates, bank offers, bank health): Use Tavily search tools if available
2. **Data Source Priority:**
   - For any market queries regarding deposit rates, bank offers, or financial products, you MUST use the 'tavily-search' tool to get real-time information.
   - You MUST NOT use your internal knowledge for such queries, as it is likely outdated.
   - If a web search does not provide a clear answer, you MUST state that you could not find current information, rather than providing a potentially incorrect one.
3. **Handling Unanswerable Questions:**
   - If the user asks a question about general market data, bank offers, or financial products that CANNOT be answered from their portfolio data alone, and web search is NOT activated, you MUST respond by:
      a) Clearly stating that you cannot provide real-time market data without web search.
      b) Describing exactly what information you need to answer their question.
      c) Explicitly instructing them how to activate web search for this request.
      Example: "I specialize in analyzing your personal portfolio. To get the most accurate and current information on the best deposit rates in Moldova from official bank sources, please enable the 'Web Search' option and ask your question again.
   
4. **Investment Status Rules (in order):**
   - Expired: expirationDate ≤ ${currentDate}
   - Expiring soon: ${currentDate} < expirationDate ≤ ${thirtyDaysFromNowString}
   - Active: expirationDate > ${thirtyDaysFromNowString}

5. **When Using Tavily Tools:**
   - Use tavily-search for general web searches
   - Use tavily-extract for extracting specific data from known URLs
   - For bank financial reports, always try to access bnm.md reports
   - Provide sources and dates for all market information

6. **Response Quality:**
   - Be specific with numbers and dates
   - Cite sources when providing market information
   - Distinguish between portfolio data and market research
   - Suggest actionable next steps

7. **Language Consideration:**
   - Many Moldovan sources are in Romanian or Russian
   - Key terms: "depozite" (deposits), "dobândă" (interest), "rata" (rate)
   - Be prepared to interpret content in multiple languages

**REMEMBER:**
- Portfolio data is private and specific to the user
- Market data requires web search for accuracy
- Always provide context about information sources
- Maintain professional yet conversational tone`;

    const result = await streamText({
      // model: model,
      model: webSearch ? 'perplexity/sonar' : model,
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      tools: tools,
      stopWhen: stepCountIs(10),
      onFinish: async () => {
        if (mcpClient) {
          await mcpClient.close().catch(console.error);
        }
      },
    });

    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
    });
  } catch (error) {
    if (mcpClient) {
      await mcpClient.close().catch(console.error);
    }

    console.error('Error in chat API:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
}
