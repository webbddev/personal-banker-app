const API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;

type ExchangeRateData = {
  time: string;
  value: number;
};

export async function getHistoricalEurUsdRate(): Promise<ExchangeRateData[]> {
  if (!API_KEY) {
    console.warn(
      'ExchangeRate-API key not found. Cannot fetch historical data.'
    );
    return [];
  }

  const historicalData: ExchangeRateData[] = [];
  const today = new Date();

  // Fetch data for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/history/EUR/${year}/${month}/${day}`;

    try {
      const response = await fetch(URL);
      if (!response.ok) {
        console.error(
          `API request failed for date ${year}-${month}-${day}: ${response.status}`
        );
        continue; // Skip to the next day
      }

      const data = await response.json();
      if (data.result === 'success' && data.conversion_rates.USD) {
        historicalData.push({
          time: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          value: data.conversion_rates.USD,
        });
      } else {
        console.error(
          `API error for date ${year}-${month}-${day}: ${data['error-type']}`
        );
      }
    } catch (error) {
      console.error(
        `Failed to fetch historical exchange rates for date ${year}-${month}-${day}:`,
        error
      );
    }
  }

  // Sort data by date in ascending order for the chart
  return historicalData.sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );
}
