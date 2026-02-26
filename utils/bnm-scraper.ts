import * as cheerio from 'cheerio';
import { prisma } from '@/lib/prisma'; // I should check if lib/prisma exists. The project setup says `import { Investment, User } from '@/prisma/generated/prisma/client';` in mailer. We should check how Prisma is instantiated.

export async function fetchBnmBaseRate(): Promise<number | null> {
  try {
    const res = await fetch('https://bnm.md/ro', {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('Failed to fetch BNM page');
    const html = await res.text();
    const $ = cheerio.load(html);

    const baseRateStr = $('.view-rates .rate .rate-value')
      .first()
      .text()
      .trim();
    if (!baseRateStr) return null;

    const val = parseFloat(baseRateStr.replace('%', '').trim());
    return isNaN(val) ? null : val;
  } catch (error) {
    console.error('Error fetching BNM base rate:', error);
    return null;
  }
}
