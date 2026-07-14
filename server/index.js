import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import WebSocket from 'ws';
import * as dhan from 'dhanhq';
import dotenv from 'dotenv';
import fs from 'fs/promises';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*', // Allow all origins for simple integration
  credentials: true
}));

app.use(express.json());

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Map Yahoo Finance tickers to local symbols
const TICKER_MAP = {
  '^NSEI': 'NIFTY50',
  '^NSEBANK': 'BANKNIFTY',
  'RELIANCE.NS': 'RELIANCE',
  'TCS.NS': 'TCS',
  'HDFCBANK.NS': 'HDFCBANK',
  'INFY.NS': 'INFY',
  'ICICIBANK.NS': 'ICICIBANK',
  'ITC.NS': 'ITC',
  'HINDUNILVR.NS': 'HINDUNILVR',
  'SBIN.NS': 'SBIN',
  'ONGC.NS': 'ONGC',
  'COALINDIA.NS': 'COALINDIA',
  'AXISBANK.NS': 'AXISBANK',
  'KOTAKBANK.NS': 'KOTAKBANK',
  'HCLTECH.NS': 'HCLTECH',
  'WIPRO.NS': 'WIPRO',
  'TECHM.NS': 'TECHM',
  'M&M.NS': 'M&M',
  'TMCV.NS': 'TATAMOTORS',
  'MARUTI.NS': 'MARUTI',
  'BAJAJ-AUTO.NS': 'BAJAJ-AUTO',
  'EICHERMOT.NS': 'EICHERMOT',
  'NESTLEIND.NS': 'NESTLEIND',
  'BRITANNIA.NS': 'BRITANNIA',
  'TATACONSUM.NS': 'TATACONSUM',
  'TATASTEEL.NS': 'TATASTEEL',
  'HINDALCO.NS': 'HINDALCO',
  'JSWSTEEL.NS': 'JSWSTEEL',
  'NATIONALUM.NS': 'NATIONALUM'
};

// Fetch live stock details from Yahoo Finance Chart API
async function fetchYahooQuote(yahooSymbol) {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`, {
      headers: { 'User-Agent': USER_AGENT }
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    if (!data.chart || !data.chart.result || !data.chart.result[0]) {
      throw new Error("Invalid chart data structure");
    }
    
    const meta = data.chart.result[0].meta;
    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || price;
    const change = price - prevClose;
    const changePercent = (change / prevClose) * 100;
    
    return {
      symbol: TICKER_MAP[yahooSymbol] || yahooSymbol,
      yahooSymbol,
      price: Number(price.toFixed(2)),
      change: Number(changePercent.toFixed(2)),
      open: Number((meta.regularMarketPrice || price).toFixed(2)),
      high: Number((meta.regularMarketDayHigh || price).toFixed(2)),
      low: Number((meta.regularMarketDayLow || price).toFixed(2)),
      close: Number(prevClose.toFixed(2)),
      high52: meta.fiftyTwoWeekHigh || price,
      low52: meta.fiftyTwoWeekLow || price,
      volume: meta.regularMarketVolume || 0
    };
  } catch (err) {
    console.error(`Failed to fetch Yahoo quote for ${yahooSymbol}:`, err.message);
    return null;
  }
}

// 1. Endpoint: Live Stock Market Overview
app.get('/api/market/overview', async (req, res) => {
  try {
    const cachedData = Object.values(marketData);
    if (cachedData.length > 0) {
      return res.json({
        success: true,
        timestamp: new Date(),
        data: cachedData
      });
    }
    
    // Fallback: If cache is empty, fetch live once
    const symbols = Object.keys(TICKER_MAP);
    const quotes = await Promise.all(symbols.map(fetchYahooQuote));
    const validQuotes = quotes.filter(q => q !== null);
    validQuotes.forEach(q => {
      marketData[q.symbol] = q;
    });
    
    res.json({
      success: true,
      timestamp: new Date(),
      data: validQuotes
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Path for local persistent cache of FII/DII data
const FII_DII_CACHE_FILE = path.join(__dirname, 'fii-dii-cache.json');

// In-memory cache with static mock fallback as default
let cachedFiiDiiData = {
  success: true,
  source: "Static Mock Fallback",
  fallback: true,
  date: "Post-Market Hours",
  flows: [
    { segment: "FII Cash Market", netValue: -1240.50, action: "Net Seller" },
    { segment: "DII Cash Market", netValue: 2150.80, action: "Net Buyer" },
    { segment: "FII Index Futures", netValue: 480.20, action: "Net Buyer" },
    { segment: "FII Stock Futures", netValue: 920.40, action: "Net Buyer" },
    { segment: "FII Index Options", netValue: -850.30, action: "Net Seller" }
  ],
  pcr: 1.18,
  sentimentScore: 68
};

// Initialize cache from disk on startup
async function initFiiDiiCache() {
  try {
    const data = await fs.readFile(FII_DII_CACHE_FILE, 'utf-8');
    cachedFiiDiiData = JSON.parse(data);
    console.log("Loaded FII/DII data cache from disk successfully.");
  } catch (err) {
    console.log("No existing FII/DII data cache found on disk, using defaults.");
  }
}

// Helper to parse dates into comparable formats (YYYY-MM-DD)
function getNormalizedDateString(dateObj) {
  if (!dateObj || isNaN(dateObj.getTime())) return null;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Fetch and format from Sensibull
async function fetchSensibullData() {
  try {
    const response = await fetch("https://oxide.sensibull.com/v1/compute/cache/fii_dii_daily", {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "application/json, text/plain, */*",
        "Origin": "https://web.sensibull.com",
        "Referer": "https://web.sensibull.com/",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) throw new Error(`Sensibull HTTP ${response.status}`);
    const rawData = await response.json();

    if (!rawData || !rawData.data) {
      throw new Error("Invalid Sensibull response structure");
    }

    const dates = Object.keys(rawData.data).sort();
    if (dates.length === 0) {
      throw new Error("No dates found in Sensibull data");
    }

    const latestDate = dates[dates.length - 1];
    const dayData = rawData.data[latestDate];

    // Extract cash flows
    const fiiCash = dayData.cash?.fii || {};
    const diiCash = dayData.cash?.dii || {};
    
    // Extract futures flows
    const fiiFut = dayData.future?.fii || {};
    const fiiFutQty = fiiFut['quantity-wise'] || {};
    
    // Extract options flows
    const fiiOpt = dayData.option?.fii || {};
    const fiiCall = fiiOpt.call || {};
    const fiiPut = fiiOpt.put || {};
    const netCallChange = fiiCall.net_oi_change || 0;
    const netPutChange = fiiPut.net_oi_change || 0;

    // PCR calculation
    let totalPutOI = 0;
    let totalCallOI = 0;
    const participants = ['fii', 'dii', 'pro', 'client'];
    participants.forEach(p => {
      const pOpt = dayData.option?.[p] || {};
      totalCallOI += (pOpt.call?.long?.oi_current || 0);
      totalPutOI += (pOpt.put?.long?.oi_current || 0);
    });
    const calculatedPCR = totalCallOI > 0 ? Number((totalPutOI / totalCallOI).toFixed(2)) : 1.18;

    // Estimate sentiment score
    let sentimentScore = 50;
    if (fiiCash.net_view === 'BULLISH') {
      sentimentScore = fiiCash.net_view_strength === 'Strong' ? 80 : 65;
    } else if (fiiCash.net_view === 'BEARISH') {
      sentimentScore = fiiCash.net_view_strength === 'Strong' ? 20 : 35;
    }

    return {
      success: true,
      source: "Sensibull Direct",
      date: latestDate,
      dateStr: latestDate,
      updatedAt: rawData.year_month || "Just now",
      nifty: dayData.nifty || null,
      niftyChange: dayData.nifty_change_percent !== undefined ? Number(dayData.nifty_change_percent.toFixed(2)) : null,
      banknifty: dayData.banknifty || null,
      bankniftyChange: dayData.banknifty_change_percent !== undefined ? Number(dayData.banknifty_change_percent.toFixed(2)) : null,
      nextMarketOpen: dayData.next_market_open || "",
      flows: [
        {
          segment: "FII Cash Market",
          netValue: Number((fiiCash.buy_sell_difference || 0).toFixed(2)),
          buy: Number((fiiCash.buy || 0).toFixed(2)),
          sell: Number((fiiCash.sell || 0).toFixed(2)),
          action: fiiCash.net_action === 'BUY' ? "Net Buyer" : "Net Seller",
          view: fiiCash.net_view || "NEUTRAL"
        },
        {
          segment: "DII Cash Market",
          netValue: Number((diiCash.buy_sell_difference || 0).toFixed(2)),
          buy: Number((diiCash.buy || 0).toFixed(2)),
          sell: Number((diiCash.sell || 0).toFixed(2)),
          action: diiCash.net_action === 'BUY' ? "Net Buyer" : "Net Seller",
          view: diiCash.net_view || "NEUTRAL"
        },
        {
          segment: "FII Index Futures",
          netValue: fiiFutQty.net_oi || 0,
          outstanding: fiiFutQty.outstanding_oi || 0,
          action: (fiiFutQty.net_oi >= 0) ? "Net Buyer" : "Net Seller"
        },
        {
          segment: "FII Stock Futures",
          netValue: fiiFut.futures_stock_net_oi || 0,
          outstanding: fiiFut.futures_stock_outstanding_oi || 0,
          action: (fiiFut.futures_stock_net_oi >= 0) ? "Net Buyer" : "Net Seller"
        },
        {
          segment: "FII Index Options",
          netValue: netCallChange + netPutChange,
          callNetChange: netCallChange,
          putNetChange: netPutChange,
          action: (netCallChange + netPutChange >= 0) ? "Net Buyer" : "Net Seller"
        }
      ],
      pcr: calculatedPCR,
      sentimentScore: sentimentScore,
      rawDayData: dayData
    };
  } catch (error) {
    console.error("Sensibull Direct fetch failed:", error.message);
    return null;
  }
}

// Fetch and format from Mr. Chartist
async function fetchMrChartistData() {
  try {
    const response = await fetch("https://fii-diidata.mrchartist.com/api/data", {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      },
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    
    if (!data || !data.date) {
      throw new Error("Invalid Mr. Chartist response structure");
    }

    const dateObj = new Date(data.date);
    const normDate = getNormalizedDateString(dateObj);

    if (!normDate) {
      throw new Error(`Failed to parse Mr. Chartist date: ${data.date}`);
    }

    return {
      success: true,
      source: "Aggregator Backup",
      date: data.date,
      dateStr: normDate,
      updatedAt: data._updated_at || "Just now",
      nifty: data.nifty || null,
      niftyChange: data.nifty_change !== undefined ? Number(data.nifty_change) : null,
      banknifty: data.banknifty || null,
      bankniftyChange: data.banknifty_change !== undefined ? Number(data.banknifty_change) : null,
      flows: [
        { segment: "FII Cash Market", netValue: data.fii_net || 0, buy: data.fii_buy || 0, sell: data.fii_sell || 0, action: (data.fii_net >= 0) ? "Net Buyer" : "Net Seller" },
        { segment: "DII Cash Market", netValue: data.dii_net || 0, buy: data.dii_buy || 0, sell: data.dii_sell || 0, action: (data.dii_net >= 0) ? "Net Buyer" : "Net Seller" },
        { segment: "FII Index Futures", netValue: data.fii_idx_fut_net || 0, action: (data.fii_idx_fut_net >= 0) ? "Net Buyer" : "Net Seller" },
        { segment: "FII Stock Futures", netValue: data.fii_stk_fut_net || 0, action: (data.fii_stk_fut_net >= 0) ? "Net Buyer" : "Net Seller" },
        { segment: "FII Index Options", netValue: data.fii_idx_call_net + data.fii_idx_put_net || 0, action: (data.fii_idx_call_net + data.fii_idx_put_net >= 0) ? "Net Buyer" : "Net Seller" }
      ],
      pcr: data.pcr || 1.18,
      sentimentScore: data.sentiment_score || 50
    };
  } catch (error) {
    console.error("Mr. Chartist Backup fetch failed:", error.message);
    return null;
  }
}

// Validate that FII/DII data structure contains required fields and works properly
function isValidFiiDiiData(data) {
  return !!(data &&
         Array.isArray(data.flows) &&
         data.flows.length > 0 &&
         typeof data.pcr === 'number' &&
         typeof data.sentimentScore === 'number');
}

// Background sync function for FII/DII data
async function syncFiiDiiData() {
  console.log("Syncing FII/DII data from multiple sources...");
  
  // Fetch from both sources in parallel
  const [sensibullResult, mrChartistResult] = await Promise.allSettled([
    fetchSensibullData(),
    fetchMrChartistData()
  ]);

  const sData = sensibullResult.status === 'fulfilled' ? sensibullResult.value : null;
  const mData = mrChartistResult.status === 'fulfilled' ? mrChartistResult.value : null;

  const isSDataValid = isValidFiiDiiData(sData);
  const isMDataValid = isValidFiiDiiData(mData);

  let selectedData = null;

  if (isSDataValid && isMDataValid) {
    // Both succeeded and are valid. Compare dates.
    // Sensibull is 1st preference: select Sensibull if its date is equal or greater.
    if (sData.dateStr >= mData.dateStr) {
      selectedData = sData;
      console.log(`Selecting Sensibull Direct data (Date: ${sData.dateStr}) over Mr. Chartist (Date: ${mData.dateStr}) as 1st preference`);
    } else {
      selectedData = mData;
      console.log(`Selecting Mr. Chartist data (Date: ${mData.dateStr}) over Sensibull Direct (Date: ${sData.dateStr}) because Mr. Chartist has newer data`);
    }
  } else if (isSDataValid) {
    selectedData = sData;
    console.log(`Selecting Sensibull Direct data (Date: ${sData.dateStr}) as 1st preference (Mr. Chartist is missing or invalid)`);
  } else if (isMDataValid) {
    selectedData = mData;
    console.log(`Selecting Mr. Chartist data (Date: ${mData.dateStr}) because Sensibull Direct is missing or invalid`);
  }

  if (selectedData) {
    // Populate Nifty / BankNifty from live Yahoo Finance quotes if missing in the selected source
    if (!selectedData.nifty) {
      const niftyObj = marketData["NIFTY50"];
      if (niftyObj) {
        selectedData.nifty = niftyObj.price;
        selectedData.niftyChange = niftyObj.close > 0 ? Number((((niftyObj.price - niftyObj.close) / niftyObj.close) * 100).toFixed(2)) : 0;
      }
    }
    if (!selectedData.banknifty) {
      const bankniftyObj = marketData["BANKNIFTY"];
      if (bankniftyObj) {
        selectedData.banknifty = bankniftyObj.price;
        selectedData.bankniftyChange = bankniftyObj.close > 0 ? Number((((bankniftyObj.price - bankniftyObj.close) / bankniftyObj.close) * 100).toFixed(2)) : 0;
      }
    }

    // Compare with the currently cached data date to ensure we don't downgrade to older data
    const isFallback = cachedFiiDiiData.fallback === true;
    let cacheDateStr = null;
    if (cachedFiiDiiData.date) {
      const parsedCacheDate = new Date(cachedFiiDiiData.date);
      if (!isNaN(parsedCacheDate.getTime())) {
        cacheDateStr = getNormalizedDateString(parsedCacheDate);
      }
    }

    if (isFallback || !cacheDateStr || selectedData.dateStr >= cacheDateStr) {
      cachedFiiDiiData = selectedData;
      try {
        await fs.writeFile(FII_DII_CACHE_FILE, JSON.stringify(selectedData, null, 2), 'utf-8');
        console.log(`FII/DII Cache updated with data from ${selectedData.source} for date ${selectedData.dateStr}`);
      } catch (err) {
        console.error("Failed to write FII/DII cache to file:", err.message);
      }
    } else {
      console.log(`Fetched data (Date: ${selectedData.dateStr}) is older than current cache (Date: ${cacheDateStr}). Keeping current cache.`);
    }
  } else {
    console.error("All FII/DII data sources failed. Using existing in-memory/file cache.");
  }
}

// 2. Endpoint: Live FII & DII flows (served from cache)
app.get('/api/market/fii-dii', (req, res) => {
  res.json(cachedFiiDiiData);
});

app.get('/ping', (req, res) => {
  res.json({ status: "alive", timestamp: new Date() });
});

// Production: Serve React static build folder
if (process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === 'true') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// DhanHQ WebSocket Integration
let marketData = {};
let dhanFeed = null;
let isDhanConnected = false;

const DHAN_TO_YAHOO = {
  "1333": "HDFCBANK.NS",
  "2885": "RELIANCE.NS",
  "11536": "TCS.NS",
  "1594": "INFY.NS",
  "4963": "ICICIBANK.NS",
  "3045": "SBIN.NS",
  "1660": "ITC.NS",
  
  // Indices & Sectors
  "NIFTY50": "^NSEI",
  "BANKNIFTY": "^NSEBANK",
  "SENSEX": "^BSESN",
  "NIFTY BANK": "^NSEBANK",
  "NIFTY IT": "^CNXIT",
  "NIFTY AUTO": "^CNXAUTO",
  "NIFTY FMCG": "^CNXFMCG",
  "NIFTY METAL": "^CNXMETAL",
  "NIFTY PHARMA": "^CNXPHARMA",
  "NIFTY REALTY": "^CNXREALTY",
  "NIFTY ENERGY": "^CNXENERGY",
  "NIFTY MEDIA": "^CNXMEDIA",
  "NIFTY PSU BANK": "NIFTY_PSU_BANK.NS",
  "NIFTY INFRA": "NIFTY_INFRA.NS",
  
  // Other F&O stocks
  "HINDUNILVR": "HINDUNILVR.NS",
  "ONGC": "ONGC.NS",
  "COALINDIA": "COALINDIA.NS",
  "AXISBANK": "AXISBANK.NS",
  "KOTAKBANK": "KOTAKBANK.NS",
  "HCLTECH": "HCLTECH.NS",
  "WIPRO": "WIPRO.NS",
  "TECHM": "TECHM.NS",
  "M&M": "M&M.NS",
  "TATAMOTORS": "TMCV.NS",
  "MARUTI": "MARUTI.NS",
  "BAJAJ-AUTO": "BAJAJ-AUTO.NS",
  "EICHERMOT": "EICHERMOT.NS",
  "NESTLEIND": "NESTLEIND.NS",
  "BRITANNIA": "BRITANNIA.NS",
  "TATACONSUM": "TATACONSUM.NS",
  "TATASTEEL": "TATASTEEL.NS",
  "HINDALCO": "HINDALCO.NS",
  "JSWSTEEL": "JSWSTEEL.NS",
  "NATIONALUM": "NATIONALUM.NS",
  "SUNPHARMA": "SUNPHARMA.NS",
  "CIPLA": "CIPLA.NS",
  "DRREDDY": "DRREDDY.NS",
  "DIVISLAB": "DIVISLAB.NS",
  "LUPIN": "LUPIN.NS"
};

async function populateInitialMarketData() {
  console.log("Populating initial market data from Yahoo Finance...");
  try {
    for (const [dhanId, yahooSymbol] of Object.entries(DHAN_TO_YAHOO)) {
      const quote = await fetchYahooQuote(yahooSymbol);
      if (quote) {
        marketData[dhanId] = {
          symbol: dhanId,
          price: quote.price,
          open: quote.open,
          high: quote.high,
          low: quote.low,
          close: quote.close,
          volume: quote.volume,
          change: quote.change
        };
      }
    }
    io.emit('initial_market_data', marketData);
    console.log("Initial market data populated successfully!");
  } catch (err) {
    console.error("Failed to populate initial market data:", err);
  }
}

// Fallback polling: Poll Yahoo Finance every 10 seconds for live ticks
async function pollYahooFallback() {
  const targets = isDhanConnected 
    ? Object.entries(DHAN_TO_YAHOO).filter(([key]) => isNaN(Number(key)))
    : Object.entries(DHAN_TO_YAHOO);
  
  try {
    const promises = targets.map(async ([dhanId, yahooSymbol]) => {
      const quote = await fetchYahooQuote(yahooSymbol);
      if (quote) {
        const tick = {
          symbol: dhanId,
          price: quote.price,
          open: quote.open,
          high: quote.high,
          low: quote.low,
          close: quote.close,
          volume: quote.volume,
          change: quote.change
        };
        marketData[dhanId] = tick;
        io.emit('market_tick', tick);
      }
    });
    await Promise.all(promises);
  } catch (err) {
    console.error("Failed to poll Yahoo Finance fallback:", err.message);
  }
}

// Populate on startup
populateInitialMarketData();
// Poll every 10 seconds
setInterval(pollYahooFallback, 10000);

// Initialize FII/DII syncing
async function startFiiDiiSync() {
  await initFiiDiiCache();
  await syncFiiDiiData();
  // Poll every 15 minutes (900,000 ms)
  setInterval(syncFiiDiiData, 900000);
}
startFiiDiiSync();

// Monkey-patch DhanFeed to use query parameter authentication (fixes 400 Bad Request error)
dhan.DhanFeed.prototype.connect = async function() {
    if (this.accessToken === '' || this.clientId === '') {
        console.error('Access Token or Client ID is missing');
        isDhanConnected = false;
        return;
    }
    
    const WSS_URL_WITH_AUTH = `wss://api-feed.dhan.co?version=2&token=${this.accessToken}&clientId=${this.clientId}&authType=2`;
    this.ws = new WebSocket(WSS_URL_WITH_AUTH);
    
    this.ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        isDhanConnected = false;
        setTimeout(() => {
            console.log('WEBSOCKET_CLOSE: reconnecting...');
            this.connect();
        }, 5000);
    });
    
    this.ws.on('open', async () => {
        console.log('WebSocket connection established & authorized successfully via query parameters');
        isDhanConnected = true;
        await this.sdkHelper.onConnectionEstablished(this.ws);
    });
    
    this.ws.on('message', async (data) => {
        let response;
        const responseCode = data.readUInt8(0);
        switch (responseCode) {
            case 2: response = this.processTickerPacket(data); break;
            case 3: response = this.processMarketDepthPacket(data); break;
            case 4: response = this.processQuotePacket(data); break;
            case 5: response = this.processOIDataPacket(data); break;
            case 6: response = this.processPrevClosePacket(data); break;
            case 7: response = this.processMarketStatusPacket(data); break;
            case 50: 
                this.processServerDisConnectionPacket(data);
                isDhanConnected = false;
                process.exit();
                break;
            default:
                console.warn(`Unknown response code: ${responseCode}`);
                response = null;
        }
        await this.sdkHelper.onMessageReceived(response);
    });
    
    this.ws.on('close', async (code, reason) => {
        console.log(`WebSocket closed with code ${code}: ${reason}`);
        isDhanConnected = false;
        await this.sdkHelper.onClose(this.ws, code, reason.toString());
    });
};

async function startDhanFeed() {
    try {
        dhanFeed = new dhan.DhanFeed(process.env.DHAN_CLIENT_ID, process.env.DHAN_ACCESS_TOKEN, [
            { ExchangeSegment: dhan.ExchangeSegment.NSE_EQ, SecurityId: "1333" }, // HDFCBANK
            { ExchangeSegment: dhan.ExchangeSegment.NSE_EQ, SecurityId: "2885" }, // RELIANCE
            { ExchangeSegment: dhan.ExchangeSegment.NSE_EQ, SecurityId: "11536" }, // TCS
            { ExchangeSegment: dhan.ExchangeSegment.NSE_EQ, SecurityId: "1594" }, // INFY
            { ExchangeSegment: dhan.ExchangeSegment.NSE_EQ, SecurityId: "4963" }, // ICICIBANK
            { ExchangeSegment: dhan.ExchangeSegment.NSE_EQ, SecurityId: "3045" }, // SBIN
            { ExchangeSegment: dhan.ExchangeSegment.NSE_EQ, SecurityId: "1660" }  // ITC
        ], "Quote");

        dhanFeed.onConnect = () => {
            console.log("Connected to DhanHQ Live Market Feed WebSocket");
            isDhanConnected = true;
        };

        dhanFeed.onMessage = (data) => {
            if (data && data.LTP) {
                const tick = {
                    symbol: data.SecurityId, // Will map to ticker string on frontend
                    price: data.LTP,
                    open: data.Open,
                    high: data.High,
                    low: data.Low,
                    close: data.Close,
                    volume: data.Volume,
                    change: data.Close > 0 ? Number((((data.LTP - data.Close) / data.Close) * 100).toFixed(2)) : 0
                };
                marketData[data.SecurityId] = tick;
                io.emit('market_tick', tick);
            }
        };

        dhanFeed.onClose = () => {
            console.log("DhanHQ WebSocket Closed. Reconnecting in 5s...");
            isDhanConnected = false;
            setTimeout(startDhanFeed, 5000);
        };
        
        dhanFeed.connect();
    } catch (e) {
        console.error("Failed to start DhanHQ Feed:", e);
        isDhanConnected = false;
    }
}
startDhanFeed();

// Socket.io Handlers
io.on('connection', (socket) => {
    console.log('Client connected to WebSocket:', socket.id);
    socket.emit('initial_market_data', marketData);
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
  console.log(`Earn With Us Backend live on port ${PORT}`);
});
