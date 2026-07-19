import fs from 'fs';
import path from 'path';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Read server/index.js to extract DHAN_TO_YAHOO
const serverPath = path.resolve('server/index.js');
const serverContent = fs.readFileSync(serverPath, 'utf8');

// Find DHAN_TO_YAHOO object
const startMatch = serverContent.indexOf('const DHAN_TO_YAHOO = {');
if (startMatch === -1) {
  console.error("Could not find DHAN_TO_YAHOO in server/index.js");
  process.exit(1);
}

const endMatch = serverContent.indexOf('};', startMatch);
const objectString = serverContent.substring(startMatch + 'const DHAN_TO_YAHOO = {'.length, endMatch);

// Basic extraction of keys and values
const tickers = {};
const lines = objectString.split('\n');
for (const line of lines) {
  const match = line.match(/"([^"]+)":\s*"([^"]+)"/);
  if (match) {
    tickers[match[1]] = match[2];
  }
}

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
    return { success: true, price };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function run() {
  console.log(`Extracted ${Object.keys(tickers).length} tickers to test.`);
  const failed = [];
  const entries = Object.entries(tickers);
  
  for (let i = 0; i < entries.length; i++) {
    const [dhanId, sym] = entries[i];
    const result = await testYahooQuote(dhanId, sym);
    if (result.success) {
      console.log(`[${i+1}/${entries.length}] ✅ ${dhanId} -> ${sym}: Price = ${result.price}`);
    } else {
      console.error(`[${i+1}/${entries.length}] ❌ ${dhanId} -> ${sym}: FAILED (${result.error})`);
      failed.push({ dhanId, sym, error: result.error });
    }
    // Small delay to prevent rate limit
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log("\n--- TEST SUMMARY ---");
  console.log(`Total: ${entries.length}`);
  console.log(`Succeeded: ${entries.length - failed.length}`);
  console.log(`Failed: ${failed.length}`);
  if (failed.length > 0) {
    console.error("Failed tickers:", JSON.stringify(failed, null, 2));
    process.exit(1);
  } else {
    console.log("All tickers verified successfully!");
  }
}

run();
