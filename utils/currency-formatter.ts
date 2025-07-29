/**
 * Creates a currency formatter with specified locale and currency
 * @throws {Error} If currency code is missing or invalid
 */
export const currencyFormatter = (locale: string, currency: string) => {
  if (!currency) {
    throw new Error('Currency code is required');
  }

  if (
    !Object.values(SUPPORTED_CURRENCIES).includes(
      currency.toUpperCase() as SupportedCurrency
    )
  ) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Supported currencies in the application
 * @remarks These are the only currencies that can be used throughout the app
 */
export const SUPPORTED_CURRENCIES = {
  MDL: 'MDL',
  EUR: 'EUR',
  GBP: 'GBP',
} as const;

export type SupportedCurrency = keyof typeof SUPPORTED_CURRENCIES;

export const CURRENCY_OPTIONS = [
  {
    value: SUPPORTED_CURRENCIES.MDL.toLowerCase(),
    label: SUPPORTED_CURRENCIES.MDL,
    locale: 'ro-MD',
  },
  {
    value: SUPPORTED_CURRENCIES.EUR.toLowerCase(),
    label: SUPPORTED_CURRENCIES.EUR,
    locale: 'en-US',
  },
  {
    value: SUPPORTED_CURRENCIES.GBP.toLowerCase(),
    label: SUPPORTED_CURRENCIES.GBP,
    locale: 'en-GB',
  },
] as const;

export const formatAmount = (amount: number, currency: string) => {
  if (!currency || typeof currency !== 'string') {
    throw new Error('Valid currency code is required');
  }

  const uppercaseCurrency = currency.toUpperCase() as SupportedCurrency;
  const option = CURRENCY_OPTIONS.find(
    (opt) => opt.value === currency.toLowerCase()
  );

  if (!option) {
    console.warn(
      `Currency option not found for ${currency}, using default formatting`
    );
    return currencyFormatter('en-US', uppercaseCurrency).format(amount);
  }

  return currencyFormatter(option.locale, uppercaseCurrency).format(amount);
};

// Exchange rates as of 17th December 2024
// 1 MDL = X foreign currency
export const EXCHANGE_RATES = {
  MDL: 1,
  EUR: 19.11, // 1 EUR = 19.49 MDL
  GBP: 23.12, // 1 GBP = 22.52 MDL
} as const;

/**
 * Convert amount from one currency to another
 * @param amount Amount to convert
 * @param fromCurrency Currency to convert from
 * @param toCurrency Currency to convert to
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): number {
  // If same currency, return original amount
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Convert to MDL first (if not already in MDL)
  const amountInMDL =
    fromCurrency === 'MDL' ? amount : amount * EXCHANGE_RATES[fromCurrency];

  // Convert from MDL to target currency
  return toCurrency === 'MDL'
    ? amountInMDL
    : amountInMDL / EXCHANGE_RATES[toCurrency];
}
