import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.FMP_API_KEY;

async function testFMPEndpoints() {
  const symbol = 'RELIANCE.NS';
  const endpoints = [
    `https://financialmodelingprep.com/api/v3/quote-short/${encodeURIComponent(symbol)}?apikey=${apiKey}`,
    `https://financialmodelingprep.com/api/v3/profile/${encodeURIComponent(symbol)}?apikey=${apiKey}`,
    `https://financialmodelingprep.com/api/v3/stock-price-change/${encodeURIComponent(symbol)}?apikey=${apiKey}`,
    `https://financialmodelingprep.com/stable/quote?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`,
    `https://financialmodelingprep.com/api/v4/quote?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`
  ];

  for (const url of endpoints) {
    try {
      console.log(`\nTesting: ${url.split('?')[0]}`);
      const res = await fetch(url);
      const data = await res.json();
      console.log('Status:', res.status);
      console.log('Data:', JSON.stringify(data).substring(0, 300));
    } catch (err) {
      console.error('Err:', err.message);
    }
  }
}

testFMPEndpoints();
