import {
  ExchangeRates,
  SupportedCurrencyCode,
} from '@/utils/currency-formatter';

const API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/MDL`;

// A simple in-memory cache
let cachedRates: ExchangeRates | null = null;
let lastFetchTimestamp = 0;

// Cache duration: 6 hours in milliseconds
const CACHE_DURATION = 6 * 60 * 60 * 1000;

const FALLBACK_RATES: ExchangeRates = {
  MDL: 1,
  EUR: 19.11,
  GBP: 23.12,
  USD: 17.45,
};

/**
 * Fetches the latest exchange rates against MDL.
 * The rates are cached in memory to reduce API calls.
 * @returns A promise that resolves to an object with exchange rates.
 */
export async function getLatestRates(): Promise<ExchangeRates> {
  const now = Date.now();
  if (cachedRates && now - lastFetchTimestamp < CACHE_DURATION) {
    return cachedRates;
  }

  if (!API_KEY) {
    console.warn('ExchangeRate-API key not found. Using fallback rates.');
    return FALLBACK_RATES;
  }

  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);

    const data = await response.json();
    if (data.result !== 'success')
      throw new Error(`API error: ${data['error-type']}`);

    const rates = data.conversion_rates;
    const newRates: ExchangeRates = {
      MDL: 1,
      EUR: 1 / rates.EUR,
      GBP: 1 / rates.GBP,
      USD: 1 / rates.USD,
    };

    cachedRates = newRates;
    lastFetchTimestamp = now;
    return newRates;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return FALLBACK_RATES; // Return fallback on error
  }
}
