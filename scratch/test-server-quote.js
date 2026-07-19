import dotenv from 'dotenv';
dotenv.config();

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function fetchFMPQuote(symbol) {
  const apiKey = process.env.FMP_API_KEY || 'demo';
  try {
    const url = `https://financialmodelingprep.com/api/v3/quote/${encodeURIComponent(symbol)}?apikey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`FMP HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || !data[0]) throw new Error("Invalid FMP data structure");
    return { symbol, price: data[0].price, source: 'FMP' };
  } catch (err) {
    console.error(`Failed to fetch FMP quote for ${symbol}:`, err.message);
    return null;
  }
}

async function fetchYahooQuote(yahooSymbol) {
  if (process.env.USE_FMP === 'true' || process.env.FMP_API_KEY) {
    const fmpQuote = await fetchFMPQuote(yahooSymbol);
    if (fmpQuote) return fmpQuote;
    console.log(`[FMP Fallback] Switching to secondary data source for ${yahooSymbol}...`);
  }

  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`, {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const meta = data.chart.result[0].meta;
    return {
      symbol: yahooSymbol,
      price: meta.regularMarketPrice,
      source: 'Yahoo'
    };
  } catch (err) {
    console.error(`Failed to fetch Yahoo quote for ${yahooSymbol}:`, err.message);
    return null;
  }
}

fetchYahooQuote('RELIANCE.NS').then(q => console.log('Final Result:', q));
