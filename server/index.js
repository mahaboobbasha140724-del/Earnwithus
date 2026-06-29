import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import WebSocket from 'ws';
import * as dhan from 'dhanhq';
import dotenv from 'dotenv';
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
  'COALINDIA.NS': 'COALINDIA'
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
  const symbols = Object.keys(TICKER_MAP);
  try {
    const quotes = await Promise.all(symbols.map(fetchYahooQuote));
    const validQuotes = quotes.filter(q => q !== null);
    
    res.json({
      success: true,
      timestamp: new Date(),
      data: validQuotes
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Endpoint: Live FII & DII flows from Sensibull
app.get('/api/market/fii-dii', async (req, res) => {
  try {
    const response = await fetch("https://oxide.sensibull.com/v1/compute/cache/fii_dii_daily", {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "application/json, text/plain, */*",
        "Origin": "https://web.sensibull.com",
        "Referer": "https://web.sensibull.com/"
      }
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

    // PCR calculation: sum put long current / sum call long current across participants
    let totalPutOI = 0;
    let totalCallOI = 0;
    const participants = ['fii', 'dii', 'pro', 'client'];
    participants.forEach(p => {
      const pOpt = dayData.option?.[p] || {};
      totalCallOI += (pOpt.call?.long?.oi_current || 0);
      totalPutOI += (pOpt.put?.long?.oi_current || 0);
    });
    const calculatedPCR = totalCallOI > 0 ? Number((totalPutOI / totalCallOI).toFixed(2)) : 1.18;

    // Estimate sentiment score (0 - 100) based on FII cash net view
    let sentimentScore = 50;
    if (fiiCash.net_view === 'BULLISH') {
      sentimentScore = fiiCash.net_view_strength === 'Strong' ? 80 : 65;
    } else if (fiiCash.net_view === 'BEARISH') {
      sentimentScore = fiiCash.net_view_strength === 'Strong' ? 20 : 35;
    }

    res.json({
      success: true,
      source: "Sensibull Direct",
      date: latestDate,
      updatedAt: rawData.year_month || "Just now",
      nifty: dayData.nifty || 24000,
      niftyChange: Number((dayData.nifty_change_percent || 0).toFixed(2)),
      banknifty: dayData.banknifty || 50000,
      bankniftyChange: Number((dayData.banknifty_change_percent || 0).toFixed(2)),
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
    });
  } catch (error) {
    console.error("Direct Sensibull fetch failed, trying aggregator backup...", error.message);
    try {
      // Aggregator backup (Mr. Chartist)
      const response = await fetch("https://fii-diidata.mrchartist.com/api/data", {
        headers: {
          "User-Agent": USER_AGENT,
          "Accept": "application/json"
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      res.json({
        success: true,
        source: "Aggregator Backup",
        date: data.date || "Today",
        updatedAt: data._updated_at || "Just now",
        flows: [
          { segment: "FII Cash Market", netValue: data.fii_net || 0, buy: data.fii_buy || 0, sell: data.fii_sell || 0, action: (data.fii_net >= 0) ? "Net Buyer" : "Net Seller" },
          { segment: "DII Cash Market", netValue: data.dii_net || 0, buy: data.dii_buy || 0, sell: data.dii_sell || 0, action: (data.dii_net >= 0) ? "Net Buyer" : "Net Seller" },
          { segment: "FII Index Futures", netValue: data.fii_idx_fut_net || 0, action: (data.fii_idx_fut_net >= 0) ? "Net Buyer" : "Net Seller" },
          { segment: "FII Stock Futures", netValue: data.fii_stk_fut_net || 0, action: (data.fii_stk_fut_net >= 0) ? "Net Buyer" : "Net Seller" },
          { segment: "FII Index Options", netValue: data.fii_idx_call_net + data.fii_idx_put_net || 0, action: (data.fii_idx_call_net + data.fii_idx_put_net >= 0) ? "Net Buyer" : "Net Seller" }
        ],
        pcr: data.pcr || 1.18,
        sentimentScore: data.sentiment_score || 50
      });
    } catch (backupError) {
      console.error("Backup aggregator also failed, returning cached mock data...", backupError.message);
      res.json({
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
      });
    }
  }
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
  "1660": "ITC.NS"
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
          volume: quote.volume
        };
      }
    }
    io.emit('initial_market_data', marketData);
    console.log("Initial market data populated successfully!");
  } catch (err) {
    console.error("Failed to populate initial market data:", err);
  }
}

// Fallback polling: If Dhan WebSocket is disconnected, poll Yahoo Finance every 10 seconds for pseudo-live ticks
async function pollYahooFallback() {
  if (isDhanConnected) return;
  
  console.log("DhanHQ is offline. Polling live prices from Yahoo Finance fallback...");
  try {
    const promises = Object.entries(DHAN_TO_YAHOO).map(async ([dhanId, yahooSymbol]) => {
      const quote = await fetchYahooQuote(yahooSymbol);
      if (quote) {
        const tick = {
          symbol: dhanId,
          price: quote.price,
          open: quote.open,
          high: quote.high,
          low: quote.low,
          close: quote.close,
          volume: quote.volume
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
                    volume: data.Volume
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
