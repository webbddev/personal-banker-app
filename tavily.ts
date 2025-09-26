import { NextRequest, NextResponse } from 'next/server';
import {
  UIMessage,
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
} from 'ai';
import { checkUser } from '@/lib/checkUser';
import { prisma } from '@/lib/prisma';
import z from 'zod';
const { tavily } = require('@tavily/core');

const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });

export const maxDuration = 30;

export async function POST(req: NextRequest) {
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

    // Format dates consistently for AI comparison
    const formattedInvestments = userInvestments.map((investment) => ({
      ...investment,
      // Convert Date object to YYYY-MM-DD string
      expirationDate: investment.expirationDate.toISOString().split('T')[0],
    }));

    // ✅ Helper calculations
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const thirtyDaysFromNowString = thirtyDaysFromNow
      .toISOString()
      .split('T')[0];

    // Expired vs active
    const expired = userInvestments.filter(
      (i) => i.expirationDate && i.expirationDate < today
    );
    const active = userInvestments.filter(
      (i) => i.expirationDate && i.expirationDate >= today
    );

    // Expiring soon (within 30 days)
    const expiringSoon = userInvestments.filter((i) => {
      if (!i.expirationDate) return false;
      const daysDiff =
        (i.expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff > 0 && daysDiff <= 30;
    });

    // Total by currency
    const totalsByCurrency: Record<string, number> = {};
    userInvestments.forEach((i) => {
      if (!totalsByCurrency[i.currency]) totalsByCurrency[i.currency] = 0;
      totalsByCurrency[i.currency] += i.investmentAmount;
    });

    // Highest return investment(s)
    const maxReturn = Math.max(...userInvestments.map((i) => i.interestRate));
    const highestReturn = userInvestments.filter(
      (i) => i.interestRate === maxReturn
    );

    // ✅ Portfolio summary (structured data)
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

    // Trusted sources for web search (only included when webSearch is true)
    const trustedSourcesSection = webSearch
      ? `
**TRUSTED SOURCES FOR FINANCIAL INFORMATION:**
For questions about bank rates, deposits, or financial products in Moldova, ALWAYS prioritize and use information EXCLUSIVELY from the following official and reputable sources. Do not use blogs, forums, or non-specialized news sites.

- **Official Bank Websites (Moldova):**
  - https://www.victoriabank.md/ru/economii-si-investitii/depozite-la-termen/depozit-online
  - https://mobiasbanca.md/ru/individuals-deposits
  - https://micb.md/ru/depozite-persoane-fizice/
  - https://ecb.md/ru/depozity-fiziceskih-lit/
  - https://eximbank.md/ru/deposit-types
  - https://fincombank.com/ru/tipurile-de-depozite#filter=.online
  - https://www.energbank.com/ru/page/%D1%83%D1%81%D0%BB%D0%BE%D0%B2%D0%B8%D1%8F-%D0%B4%D0%B5%D0%BF%D0%BE%D0%B7%D0%B8%D1%82%D0%BE%D0%B2
  - https://comertbank.md/ru/services/physical_person/deposits/
  - https://www.procreditbank.md/ru/content/proclassic_ru
  - https://www.maib.md/ru/persoane-fizice/depozite
  
- **Financial Regulators and Market Data:**
  - https://bnm.md/ru/ - Central Bank of Moldova
  - https://mf.gov.md/ru/datoria-sectorului-public/pia%C8%9Ba-primar%C4%83-a-vms/licita%C8%9Bii-vms - Ministry of Finance Results of the auctions for the sale of State Securities

**SEARCH AND ANALYSIS STRATEGY:**
1. First, try to construct the exact URL to the most relevant page (e.g., "maib.md/en/deposits").
2. When on a bank's website, look for and follow links to PDF documents, terms & conditions, tariff sheets, and detailed product descriptions. Download and analyze these documents to provide the most accurate and comprehensive answer.
3. If the exact page cannot be found, perform a web search query specifically limited to these domains. For example: "site:maib.md best annual deposit 2025".
4. Only if no information is found on these trusted sources, you may broaden the search to general news, but always warn the user: "I couldn't find updated information on official bank websites, but according to recent news articles...".
`
      : '';

    const systemPrompt = `
${webSearch ? '**WEB SEARCH MODE ACTIVATED:** You are now authorized to perform web searches to answer questions about general market conditions, bank deposit offers, and financial products in Moldova. Use the trusted sources list below.' : "**PORTFOLIO ANALYSIS MODE:** Focus exclusively on analyzing the user's provided investment portfolio."}

You are a personal financial assistant specializing in investment portfolio analysis. Your goal is to provide clear, helpful, and human-like financial advice.

${trustedSourcesSection}

The user's investment portfolio is provided in JSON format: ${JSON.stringify(formattedInvestments)}
Full Investment Data (detailed per investment):
${JSON.stringify(formattedInvestments, null, 2)}
Portfolio Summary:
${JSON.stringify(portfolioSummary, null, 2)}
Current date: ${currentDate}

**CRITICAL GUIDELINES:**
1. **FIRST - Determine the query type:**
   - If the user asks about THEIR SPECIFIC PORTFOLIO (e.g., "my deposits", "my expiring investments", "how much do I have in EUR"), use ONLY the portfolio data provided above. NEVER use web search for this.
   - If the user asks about GENERAL MARKET INFORMATION (e.g., "best deposits in Moldova", "current rates", "bank offers"), you MUST use web search (if activated) to provide up-to-date information.

2. **Investment Status Calculation (Strict Order):** You MUST follow these rules in order.
   - **First, check for "Expired":** An investment is "Expired" if its expirationDate has already passed or is today. (i.e., expirationDate is ON OR BEFORE ${currentDate}). This is the most important check.
     - *Example: If today is ${currentDate}, an investment that expired yesterday is "Expired".*
   - **Second, check for "Expiring soon":** If not expired, an investment is "Expiring soon" if its expirationDate is AFTER today (${currentDate}) but is ON OR BEFORE ${thirtyDaysFromNowString}.
   - **Finally, check for "Active":** If it is not "Expired" and not "Expiring soon", then it is "Active".
   - **CRITICAL:** Never list an investment that has already passed its expiration date as "Expiring soon". Always label it as "Expired".

3. **Data Interpretation:**
   - organizationName: The financial institution or investment name
   - investmentType: Bank deposit, bonds, stocks, etc.
   - currency: USD, EUR, GBP, MDL, etc.
   - investmentAmount: The principal amount invested
   - interestRate: Annual percentage rate (return)
   - expirationDate: When the investment matures/expires (format: YYYY-MM-DD)

4. **Common Question Types to Handle:**
   - Portfolio summary requests
   - Currency-specific calculations ("how much in EUR?")
   - Investment type filtering ("show me bonds")
   - Status inquiries ("what's expired?" or "what's expiring soon?")
   - Return calculations ("total expected interest")
   - Comparison requests ("highest yielding investment")
   - Time-based queries ("what expires soon?")

5. **Calculation Examples:**
   - For currency conversions: "Total in EUR: [sum of EUR investments]"
   - For expected returns: "Annual interest: amount × interestRate"
   - For time calculations: "Days until expiration: date difference"
   - For total portfolio value: "Total portfolio value: sum of all investment amounts"

6. **Response Structure:**
   - Start with a direct answer to the question
   - Provide supporting details from relevant investments
   - Use natural language with numbers formatted nicely
   - Mention investment status when relevant
   - Suggest actions for expired or expiring investments

7. **Completeness and Accuracy:**
   - When asked to find or list investments that match a certain criteria (e.g., "expired", "in EUR", "bonds"), you MUST check the entire portfolio.
   - Ensure your answer is exhaustive and includes ALL matching investments. Do not stop after finding just one. For example, if there are two expired investments, you must list both.

8. **Handling Unanswerable Questions:**
   - If the user asks a question about general market data, bank offers, or financial products that CANNOT be answered from their portfolio data alone, and web search is NOT activated, you MUST respond by:
      a) Clearly stating that you cannot provide real-time market data without web search.
      b) Describing exactly what information you need to answer their question.
      c) Explicitly instructing them how to activate web search for this request.
      Example: "I specialize in analyzing your personal portfolio. To get the most accurate and current information on the best deposit rates in Moldova from official bank sources, please enable the 'Web Search' option and ask your question again. Would you like me to guide you on how to enable it?"

**EXAMPLE RESPONSES:**

1. For currency query: "You have €15,400 across 3 EUR investments. This includes: Santander deposit (€10,000), BMW bonds (€4,000), and Deutsche Bank deposit (€1,400)."

2. For expired investments: "Yes, 2 investments have expired: Santander deposit (expired Sep 9, 2025) and Tesla bonds (expired Aug 15, 2025). Would you like to discuss reinvestment options?"

3. For expiring soon: "You have 2 investments expiring soon: Santander deposit (expires Sep 20, 2025) and Caja Madrid deposit (expires Oct 01, 2025). Would you like to review these?"

4. For type filter: "You have 3 bank deposits totaling $25,000: JPMorgan ($15,000), Bank of America ($7,000), and Wells Fargo ($3,000). All are currently active."

5. For return calculation: "Your total expected annual interest is $1,225: JPMorgan deposit yields $600 (4%), Apple bonds yield $625 (5%), and..."

**REMEMBER:**
- Use web search only for general market data, not user-specific information
- Always calculate based on the most current data provided
- Be precise with financial calculations and dates
- Maintain conversational but professional tone throughout
`;

    const webSearchTool = tool({
      description:
        'Search the web for up-to-date information. Will return the content of the page as well',
      inputSchema: z.object({
        prompt: z.string().describe('The prompt to search the web for'),
      }),
      execute: async ({ prompt }) => {
        const response = await tavilyClient.search(prompt);
        return response.results.map(
          (result: { title: string; url: string; content: string }) => ({
            title: result.title,
            url: result.url,
            content: result.content,
          })
        );
        // const  results  = await tavilyClient.search(prompt, {
        //   maxResults: 5,
        // });
        // // return response.content;
        // return results.map((result: { title: string; url: string }) => ({
        //   title: result.title,
        //   url: result.url,
        // }));
      },
    });

    const urlContextTool = tool({
      description: 'Get the context of a URL',
      inputSchema: z.object({
        url: z.string().describe('The URL to get the context of'),
      }),
      execute: async ({ url }) => {
        const { results } = await tavilyClient.extract([url]);
        console.log(results);
        return results.map((result: { url: string; rawContent: string }) => ({
          url: result.url,
          content:
            result.rawContent?.slice(0, 200) ?? 'No relevant content found',
        }));
      },
    });

    const result = await streamText({
      // model: model,
      model: webSearch ? 'perplexity/sonar' : model,
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      providerOptions: {
        xai: {},
      },
      tools: {
        webSearch: webSearchTool,
        urlContext: urlContextTool,
      },
      stopWhen: stepCountIs(10),
    });

    // ✅ Logging AI tokens usage
    result.usage.then((usage) => {
      console.log('AI Model Usage:', {
        messageCount: messages.length,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      });
    });

    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to process chat message',
        details: errorMessage,
      }),
      { status: 500 }
    );
  }
}

// messages: [
//   { role: 'system', content: systemPrompt },
//   ...convertToModelMessages(messages),
// ],
