import { niftySectors } from '../src/data/niftySectors.js';

// Fixed ticker generation logic: overrides BEFORE truncation
function getTicker(name) {
  let ticker = name
    .replace(/ Ltd$/, '')
    .replace(/ Co$/, '')
    .replace(/ Corporation$/, '')
    .replace(/ India$/, '')
    .replace(/ Limited$/, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
    
  if (ticker === 'STATEBANKOFINDIA') ticker = 'SBIN';
  if (ticker === 'TATACONSULTANCYSERVICES') ticker = 'TCS';
  if (ticker === 'HINDUSTANUNILEVER') ticker = 'HINDUNILVR';
  if (ticker === 'MAHINDRAMAHINDRA') ticker = 'M&M';
  if (ticker === 'SUNPHARMACEUTICALINDUSTRIES') ticker = 'SUNPHARMA';
  if (ticker === 'ZEEENTERTAINMENTENTERPRISES') ticker = 'ZEEL';
  if (ticker === 'KOTAKMAHINDRABANK') ticker = 'KOTAKBANK';
  if (ticker === 'INFOSYS') ticker = 'INFY';
  if (ticker === 'HCLTECHNOLOGIES') ticker = 'HCLTECH';
  if (ticker === 'TECHMAHINDRA') ticker = 'TECHM';
  if (ticker === 'MARUTISUZUKI') ticker = 'MARUTI';
  if (ticker === 'BAJAJAUTO') ticker = 'BAJAJ-AUTO';
  if (ticker === 'EICHERMOTORS') ticker = 'EICHERMOT';
  if (ticker === 'NESTLE') ticker = 'NESTLEIND';
  if (ticker === 'BRITANNIAINDUSTRIES') ticker = 'BRITANNIA';
  if (ticker === 'TATACONSUMERPRODUCTS') ticker = 'TATACONSUM';
  if (ticker === 'HINDALCOINDUSTRIES') ticker = 'HINDALCO';
  if (ticker === 'NATIONALALUMINIUM') ticker = 'NATIONALUM';
  if (ticker === 'DRREDDYSLABORATORIES') ticker = 'DRREDDY';
  if (ticker === 'DIVISLABORATORIES') ticker = 'DIVISLAB';
  
  if (ticker.length > 10) ticker = ticker.substring(0, 10);
  return ticker;
}

const DHAN_TO_YAHOO = {
  "HDFCBANK": "HDFCBANK.NS",
  "RELIANCE": "RELIANCE.NS",
  "TCS": "TCS.NS",
  "INFY": "INFY.NS",
  "ICICIBANK": "ICICIBANK.NS",
  "SBIN": "SBIN.NS",
  "ITC": "ITC.NS",
  
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

const allConstituents = new Set();
const sectorConstituentsMap = {};

niftySectors.forEach(sec => {
  sec.constituents.forEach(c => {
    const symbol = getTicker(c.name);
    allConstituents.add(symbol);
    sectorConstituentsMap[symbol] = {
      name: c.name,
      sector: sec.name
    };
  });
});

console.log("Total unique constituents:", allConstituents.size);
console.log("\nConstituents missing from DHAN_TO_YAHOO:");
const missing = [];
allConstituents.forEach(sym => {
  if (!DHAN_TO_YAHOO[sym]) {
    missing.push({
      symbol: sym,
      name: sectorConstituentsMap[sym].name,
      sector: sectorConstituentsMap[sym].sector
    });
  }
});

console.log(JSON.stringify(missing, null, 2));
