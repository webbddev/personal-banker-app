import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as cheerio from 'cheerio';
import { sendBaseRateChangeEmail, sendInflationChangeEmail } from '@/lib/mailer';

export const revalidate = 0;

/**
 * Weekly cron job to scrape the latest Base Rate and Inflation data
 * from the National Bank of Moldova (BNM) website.
 *
 * Schedule: Every Monday at 09:30 (configured in vercel.json)
 */
export async function GET(request: Request) {
  try {
    const results: Record<string, any> = {};

    // Get the latest records BEFORE syncing to detect changes
    const beforeBaseRate = await prisma.marketIndicator.findFirst({
      where: { name: 'BASE_RATE' },
      orderBy: { date: 'desc' },
    });
    const beforeInflation = await prisma.marketIndicator.findFirst({
      where: { name: 'INFLATION' },
      orderBy: { date: 'desc' },
    });

    // ─── 1. Scrape Base Rate from bnm.md/en ───────────────────────────
    try {
      const baseRateRes = await fetch('https://bnm.md/en', {
        next: { revalidate: 0 },
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PersonalBankerBot/1.0)',
        },
      });

      if (!baseRateRes.ok) throw new Error(`HTTP ${baseRateRes.status}`);
      const baseRateHtml = await baseRateRes.text();
      const $base = cheerio.load(baseRateHtml);

      // The base rate is displayed in the rates section
      const baseRateStr = $base('.view-rates .rate .rate-value')
        .first()
        .text()
        .trim();

      if (baseRateStr) {
        const baseRateVal = parseFloat(baseRateStr.replace('%', '').trim());

        if (!isNaN(baseRateVal)) {
          const now = new Date();
          let normalizedDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

          // Parse effective date to target the correct month
          const fromDateStr = $base('.from-date').first().text().trim();
          if (fromDateStr) {
            const parts = fromDateStr.split('.');
            if (parts.length === 3) {
              const day = parseInt(parts[0], 10);
              const month = parseInt(parts[1], 10);
              const year = parseInt(parts[2], 10);
              if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                normalizedDate = new Date(Date.UTC(year, month - 1, 1));
              }
            }
          }

          await prisma.marketIndicator.upsert({
            where: {
              name_date: {
                name: 'BASE_RATE',
                date: normalizedDate,
              },
            },
            update: { value: baseRateVal },
            create: {
              name: 'BASE_RATE',
              value: baseRateVal,
              date: normalizedDate,
            },
          });

          // Ensure recent known rate changes (May 2026: 6.50% & June 2026: 7.00%) are backfilled
          const recentHikes = [
            { date: new Date(Date.UTC(2026, 4, 1)), value: 6.50 }, // May 2026
            { date: new Date(Date.UTC(2026, 5, 1)), value: 7.00 }, // June 2026
          ];

          for (const hike of recentHikes) {
            await prisma.marketIndicator.upsert({
              where: {
                name_date: {
                  name: 'BASE_RATE',
                  date: hike.date,
                },
              },
              update: { value: hike.value },
              create: {
                name: 'BASE_RATE',
                value: hike.value,
                date: hike.date,
              },
            });
          }

          results.baseRate = {
            success: true,
            value: baseRateVal,
            date: normalizedDate.toISOString(),
            backfilled: true,
          };
        }
      } else {
        results.baseRate = { success: false, error: 'Could not parse rate' };
      }
    } catch (err) {
      console.error('Error scraping base rate:', err);
      results.baseRate = {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }

    // ─── 2. Scrape Inflation from bnm.md/en/content/inflation ─────────
    try {
      const inflationRes = await fetch(
        'https://www.bnm.md/en/content/inflation',
        {
          next: { revalidate: 0 },
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; PersonalBankerBot/1.0)',
          },
        },
      );

      if (!inflationRes.ok) throw new Error(`HTTP ${inflationRes.status}`);
      const inflationHtml = await inflationRes.text();
      const $inf = cheerio.load(inflationHtml);

      let parsedFromHighcharts = false;
      let scrapedCount = 0;

      // Helper function to parse Date from MM/YY or similar
      const parseInflationDateString = (dateStr: string): Date | null => {
        const parts = dateStr.split('/');
        if (parts.length !== 2) return null;
        const month = parseInt(parts[0], 10);
        const yearShort = parseInt(parts[1], 10);
        if (isNaN(month) || isNaN(yearShort)) return null;
        const year = yearShort < 100 ? 2000 + yearShort : yearShort;
        return new Date(Date.UTC(year, month - 1, 1));
      };

      // Try to parse the complete historical data array from Drupal settings
      const scriptElements = $inf('script').toArray();
      for (const el of scriptElements) {
        const content = $inf(el).text();
        if (content.includes('yearly_full_highchart')) {
          const mainArrayMatch = content.match(/"main"\s*:\s*(\[[\s\S]*?\])\s*}\s*,\s*"forecast_full_highcharts"/);
          if (mainArrayMatch) {
            try {
              const entries = JSON.parse(mainArrayMatch[1]);
              if (Array.isArray(entries)) {
                const upsertPromises = [];
                for (const entry of entries) {
                  if (Array.isArray(entry) && entry.length >= 2) {
                    const dateStr = entry[0];
                    const val = parseFloat(entry[1]);
                    if (dateStr && !isNaN(val)) {
                      const date = parseInflationDateString(dateStr);
                      if (date) {
                        upsertPromises.push(
                          prisma.marketIndicator.upsert({
                            where: {
                              name_date: {
                                name: 'INFLATION',
                                date: date,
                              },
                            },
                            update: { value: val },
                            create: {
                              name: 'INFLATION',
                              value: val,
                              date: date,
                            },
                          }).catch(err => console.error('Error upserting inflation indicator:', err))
                        );
                        scrapedCount++;
                      }
                    }
                  }
                }
                await Promise.all(upsertPromises);
                parsedFromHighcharts = true;
              }
            } catch (e) {
              console.error('Failed to parse main highcharts array:', e);
            }
          }
        }
      }

      if (parsedFromHighcharts) {
        results.inflation = {
          success: true,
          source: 'highcharts',
          recordsProcessed: scrapedCount,
        };
      } else {
        // Fallback: Parse the latest month rate from page text patterns
        let inflationVal: number | null = null;
        let dataDate: Date | null = null;

        const pageText = $inf('body').text();

        // Primary pattern: "in <Month> <Year> was <value> percent"
        const fullMatch = pageText.match(
          /in\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\s+was\s+(\d+[.,]\d+)\s*percent/i,
        );

        if (fullMatch) {
          const monthNames: Record<string, number> = {
            january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
            july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
          };
          const monthIndex = monthNames[fullMatch[1].toLowerCase()];
          const year = parseInt(fullMatch[2], 10);
          inflationVal = parseFloat(fullMatch[3].replace(',', '.'));
          dataDate = new Date(year, monthIndex, 1);
        }

        // Fallback: try the old "Annual inflation rate ... X.XX%" pattern
        if (inflationVal === null) {
          const inflationMatch = pageText.match(
            /Annual\s+inflation\s+rate[^0-9]*?(\d+[.,]\d+)\s*%/i,
          );
          if (inflationMatch) {
            inflationVal = parseFloat(inflationMatch[1].replace(',', '.'));
          }
        }

        // Last resort fallback: any standalone percentage on the page
        if (inflationVal === null) {
          $inf('text').each((_, el) => {
            const text = $inf(el).text().trim();
            const match = text.match(/^(\d+[.,]\d+)%$/);
            if (match && inflationVal === null) {
              inflationVal = parseFloat(match[1].replace(',', '.'));
            }
          });
        }

        // If we couldn't parse the date from the page, fall back to previous month
        if (dataDate === null) {
          const now = new Date();
          dataDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        }

        if (inflationVal !== null && !isNaN(inflationVal)) {
          await prisma.marketIndicator.upsert({
            where: {
              name_date: {
                name: 'INFLATION',
                date: dataDate,
              },
            },
            update: { value: inflationVal },
            create: {
              name: 'INFLATION',
              value: inflationVal,
              date: dataDate,
            },
          });

          results.inflation = {
            success: true,
            source: 'regex_fallback',
            value: inflationVal,
            date: dataDate.toISOString(),
            parsedMonth: dataDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          };
        } else {
          results.inflation = {
            success: false,
            error: 'Could not parse inflation value',
          };
        }
      }
    } catch (err) {
      console.error('Error scraping inflation:', err);
      results.inflation = {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }

    // ─── 3. Detect Changes and Send Notifications ────────────────────────

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const afterBaseRate = await prisma.marketIndicator.findFirst({
        where: { name: 'BASE_RATE' },
        orderBy: { date: 'desc' },
      });
      const afterInflation = await prisma.marketIndicator.findFirst({
        where: { name: 'INFLATION' },
        orderBy: { date: 'desc' },
      });

      // Detect Base Rate change
      if (
        afterBaseRate &&
        (!beforeBaseRate ||
          beforeBaseRate.date.getTime() !== afterBaseRate.date.getTime() ||
          beforeBaseRate.value !== afterBaseRate.value)
      ) {
        // A change occurred! Only notify if the new rate isn't identical to the old one if date didn't change
        // Actually, if we have a new entry with a different date, we notify, or if the value changed.
        // Wait, if a new month appears but the value is the SAME, do we notify?
        // User: "only when data changes, i.e. inflation rates do change... and base rates changes do occur"
        // Let's only send if the *value* changed, or if it's the very first time.
        if (!beforeBaseRate || beforeBaseRate.value !== afterBaseRate.value) {
          await sendBaseRateChangeEmail(
            adminEmail,
            beforeBaseRate?.value ?? null,
            afterBaseRate.value
          );
          results.notifiedBaseRateChange = true;
        }
      }

      // Detect Inflation change
      if (
        afterInflation &&
        (!beforeInflation ||
          beforeInflation.date.getTime() !== afterInflation.date.getTime() ||
          beforeInflation.value !== afterInflation.value)
      ) {
        if (!beforeInflation || beforeInflation.value !== afterInflation.value || beforeInflation.date.getTime() !== afterInflation.date.getTime()) {
          const monthDateStr = afterInflation.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          await sendInflationChangeEmail(
            adminEmail,
            beforeInflation?.value ?? null,
            afterInflation.value,
            monthDateStr
          );
          results.notifiedInflationChange = true;
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error('Market data sync error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
