const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const symbolsToTest = {
  "DLF": "DLF.NS",
  "LODHA (Macrotech)": "LODHA.NS",
  "GODREJPROP": "GODREJPROP.NS",
  "OBEROIRLTY": "OBEROIRLTY.NS",
  "PRESTIGE": "PRESTIGE.NS",
  "NTPC": "NTPC.NS",
  "POWERGRID": "POWERGRID.NS",
  "ADANIGREEN": "ADANIGREEN.NS",
  "ZEEL": "ZEEL.NS",
  "SUNTV": "SUNTV.NS",
  "PVRINOX": "PVRINOX.NS",
  "NETWORK18": "NETWORK18.NS",
  "TV18BRDCST": "TV18BRDCST.NS",
  "BANKBARODA": "BANKBARODA.NS",
  "PNB": "PNB.NS",
  "CANBK": "CANBK.NS",
  "UNIONBANK": "UNIONBANK.NS",
  "INDUSINDBK": "INDUSINDBK.NS",
  "LT (Larsen & Toubro)": "LT.NS",
  "ULTRACEMCO": "ULTRACEMCO.NS",
  "ADANIPORTS": "ADANIPORTS.NS"
};

async function testYahooQuote(name, yahooSymbol) {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`, {
      headers: { 'User-Agent': USER_AGENT }
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    if (!data.chart || !data.chart.result || !data.chart.result[0]) {
      throw new Error("Invalid chart data structure");
    }
    
    const meta = data.chart.result[0].meta;
    const price = meta.regularMarketPrice;
    console.log(`✅ SUCCESS - ${name} (${yahooSymbol}): Price = ${price}`);
  } catch (err) {
    console.error(`❌ FAILED  - ${name} (${yahooSymbol}): ${err.message}`);
  }
}

async function run() {
  console.log("Starting Yahoo Ticker test for constituents...");
  for (const [name, sym] of Object.entries(symbolsToTest)) {
    await testYahooQuote(name, sym);
  }
}

run();
