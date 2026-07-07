import { niftySectors } from './niftySectors';

// A simple LCG or mulberry32 seeded random number generator
function createRandom(seedString) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedString.length; i++) {
    h = Math.imul(h ^ seedString.charCodeAt(i), 16777619);
  }
  return function() {
    h += 0xe120fc15;
    let z = h;
    z = Math.imul(z ^ (z >>> 16), 0x180ec6d3);
    z = Math.imul(z ^ (z >>> 15), 0x107f10f6);
    return (((z ^ (z >>> 16)) >>> 0) / 4294967296);
  };
}

export function generateHistoricalData(numWeeks = 104) {
  const data = [];
  // Initialize Nifty 50 Benchmark starting at 18000
  const randBench = createRandom("NIFTY 50 BENCHMARK");
  let benchPrice = 18000;
  const benchPrices = [benchPrice];
  
  for (let w = 1; w <= numWeeks; w++) {
    const weeklyDrift = 0.0015; // ~8% annual return
    const vol = 0.015; // ~1.5% weekly vol
    const rand = randBench() * 2 - 1; // -1 to 1
    benchPrice = benchPrice * (1 + weeklyDrift + rand * vol);
    benchPrices.push(benchPrice);
  }

  // Create date labels
  const dateLabels = [];
  const baseDate = new Date(); // Dynamically use today's date
  for (let w = numWeeks; w >= 0; w--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - w * 7);
    const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    dateLabels.push(dateStr);
  }

  // Generate data for each sector
  const sectorHistory = niftySectors.map((sector) => {
    const rand = createRandom(sector.symbol);
    
    // Rotation parameters: Center, Radius (X, Y), speed, initial phase
    const speed = 0.05 + rand() * 0.05; // speed of orbit (rad per week)
    const rx = 2.5 + rand() * 2.0; // momentum radius
    const ry = 2.5 + rand() * 2.0; // strength radius
    const phaseOffset = rand() * Math.PI * 2; // start phase
    const cx = 99.6 + rand() * 0.8;
    const cy = 99.6 + rand() * 0.8;

    // Generate weekly RRG coordinates
    const rrgCoords = [];
    for (let w = 0; w <= numWeeks; w++) {
      const theta = phaseOffset + speed * w;
      // Clockwise rotation: x is sin (momentum), y is cos (ratio)
      const x = cx + rx * Math.sin(theta) + (rand() - 0.5) * 0.3;
      const y = cy + ry * Math.cos(theta) + (rand() - 0.5) * 0.3;
      rrgCoords.push({ x, y });
    }

    // Now calculate prices: Returns are benchmark returns + alpha based on RS-Ratio (y)
    const returns = [];
    for (let w = 1; w <= numWeeks; w++) {
      const benchRet = (benchPrices[w] - benchPrices[w-1]) / benchPrices[w-1];
      const rrgY = rrgCoords[w].y;
      // If y > 100, positive outperformance, if y < 100, negative outperformance
      const alpha = (rrgY - 100) * 0.0035; // 1% RRG Y = ~0.35% weekly outperformance
      const sectorRet = benchRet + alpha + (rand() - 0.5) * 0.008; // add noise
      returns.push(sectorRet);
    }

    // Work backwards from current price to find all historical prices
    const prices = new Array(numWeeks + 1);
    prices[numWeeks] = sector.price;
    for (let w = numWeeks - 1; w >= 0; w--) {
      prices[w] = prices[w+1] / (1 + returns[w]);
    }

    // Top constituents
    const constituentsHistory = sector.constituents.map((c) => {
      const randStock = createRandom(c.name + sector.symbol);
      const stockSpeed = 0.08 + randStock() * 0.06;
      const sRx = 1.0 + randStock() * 1.2;
      const sRy = 1.0 + randStock() * 1.2;
      const stockPhase = randStock() * Math.PI * 2;

      // Coordinate relative to sector
      const stockCoords = [];
      for (let w = 0; w <= numWeeks; w++) {
        const sTheta = stockPhase + stockSpeed * w;
        const x = rrgCoords[w].x + sRx * Math.sin(sTheta) + (randStock() - 0.5) * 0.15;
        const y = rrgCoords[w].y + sRy * Math.cos(sTheta) + (randStock() - 0.5) * 0.15;
        stockCoords.push({ x, y });
      }

      // Constituent price: base price proportional to weight and sector price
      const weightNum = parseFloat(c.weight) || 10;
      const stockBasePrice = (sector.price / 30) * (weightNum / 20) * (0.8 + randStock() * 0.4);
      const stockPrices = new Array(numWeeks + 1);
      
      // We will generate returns for stock vs sector and scale back
      const sReturns = [];
      for (let w = 1; w <= numWeeks; w++) {
        const secRet = (prices[w] - prices[w-1]) / prices[w-1];
        const stockY = stockCoords[w].y;
        const secY = rrgCoords[w].y;
        const stockAlpha = (stockY - secY) * 0.004; // outperformance of stock vs sector
        const stockRet = secRet + stockAlpha + (randStock() - 0.5) * 0.012;
        sReturns.push(stockRet);
      }

      // Establish final price of stock
      const finalPrice = Math.round(stockBasePrice * 2.5 * 100) / 100;
      stockPrices[numWeeks] = finalPrice;
      for (let w = numWeeks - 1; w >= 0; w--) {
        stockPrices[w] = Math.round((stockPrices[w+1] / (1 + sReturns[w])) * 100) / 100;
      }

      // Map stock to a symbol-like ticker
      let ticker = c.name
        .replace(/ Ltd$/, '')
        .replace(/ Co$/, '')
        .replace(/ Corporation$/, '')
        .replace(/ India$/, '')
        .replace(/ Limited$/, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase();
      if (ticker.length > 10) ticker = ticker.substring(0, 10);
      if (ticker === 'STATEBANKOFINDIA') ticker = 'SBIN';
      if (ticker === 'TATACONSULTANCYSERVICES') ticker = 'TCS';
      if (ticker === 'HINDUSTANUNILEVER') ticker = 'HINDUNILVR';
      if (ticker === 'MAHINDRAMAHINDRA') ticker = 'M&M';
      if (ticker === 'SUNPHARMACEUTICALINDUSTRIES') ticker = 'SUNPHARMA';
      if (ticker === 'ZEEENTERTAINMENTENTERPRISES') ticker = 'ZEEL';

      return {
        name: c.name,
        symbol: ticker,
        weight: c.weight,
        prices: stockPrices,
        rrg: stockCoords
      };
    });

    return {
      name: sector.name,
      symbol: sector.symbol,
      prices: prices,
      rrg: rrgCoords,
      constituents: constituentsHistory,
      outlook: sector.outlook
    };
  });

  return {
    weeks: numWeeks,
    dateLabels: dateLabels,
    benchmark: {
      name: "Nifty 50 Index",
      symbol: "NIFTY 50",
      prices: benchPrices
    },
    sectors: sectorHistory
  };
}

// Generate static dataset
export const historicalRrgData = generateHistoricalData(104);
