import React, { useState } from 'react';
import { 
  Compass, Layers, Flame, ShieldCheck, TrendingUp, Percent, Clock, AlertCircle, 
  BookOpen, ChevronRight, CheckCircle, Info, Copy, Check 
} from 'lucide-react';

const CATEGORIES = [
  { id: "structure", label: "Structure", icon: Compass },
  { id: "gaps-blocks", label: "Gaps & Blocks", icon: Layers },
  { id: "liquidity", label: "Liquidity", icon: ShieldCheck },
  { id: "advanced", label: "Advanced Tools", icon: TrendingUp }
];

const STRATEGIES_DATA = [
  // --- STRUCTURE ---
  {
    id: "bos",
    category: "structure",
    title: "Break of Structure (BOS)",
    subtitle: "Trend Continuation Metric",
    difficulty: "Beginner",
    color: "#10b981", // Emerald
    description: "A Break of Structure occurs when the price breaks and closes beyond a major swing level in the direction of the dominant trend, confirming that the current market structure continues to hold bullish or bearish momentum.",
    concepts: [
      "Swing High & Swing Low validation",
      "Closing body confirmation (not just a wick pierce)",
      "Trend continuation signposting"
    ],
    rules: [
      "Identify the dominant trend (Bullish: Higher Highs/Lows; Bearish: Lower Highs/Lows).",
      "Locate the most recent swing high (in an uptrend) or swing low (in a downtrend).",
      "Wait for a candle to break and close completely past that swing level.",
      "Consider the structure officially broken (BOS) and look for pullback entries."
    ],
    pineCodeSnippet: `//@version=5
indicator("Flux - Break of Structure (BOS)", overlay=true)
leftBars = 5
rightBars = 5
ph = ta.pivothigh(high, leftBars, rightBars)
pl = ta.pivotlow(low, leftBars, rightBars)

var float last_ph = na
if not na(ph)
    last_ph := ph

isBOS = ta.crossover(close, last_ph)
plotshape(isBOS, "BOS", shape.triangleup, location.belowbar, color.green, size=size.small)`
  },
  {
    id: "choch",
    category: "structure",
    title: "Change of Character (CHoCH)",
    subtitle: "First Signal of Trend Reversal",
    difficulty: "Intermediate",
    color: "#0ea5e9", // Sky Blue
    description: "The Change of Character is the first structural shift signaling that a trend may be reversing. It occurs when the price breaks and closes below the last swing low (in an uptrend) or above the last swing high (in a downtrend).",
    concepts: [
      "First structural sign of trend failure",
      "Requires candle body close to confirm character shift",
      "Differentiates itself from a simple pull back"
    ],
    rules: [
      "Identify the final swing low in an uptrend that created the highest high.",
      "Monitor the market for a rapid counter-trend push.",
      "If the price breaks and closes below that critical swing low, CHoCH is triggered.",
      "Prepare for a shift in sentiment and start looking for counter-trend entries on retracements."
    ],
    pineCodeSnippet: `//@version=5
indicator("Flux - Change of Character (CHoCH)", overlay=true)
lb = 5
rb = 5
pl = ta.pivotlow(low, lb, rb)
var float last_pl = na
if not na(pl)
    last_pl := pl

isCHoCH = ta.crossunder(close, last_pl)
plotshape(isCHoCH, "CHoCH", shape.labeldown, location.abovebar, color.orange, text="CHoCH")`
  },
  {
    id: "choch-plus",
    category: "structure",
    title: "Change of Character Plus (CHoCH+)",
    subtitle: "Highly Confirmed Trend Shift",
    difficulty: "Advanced",
    color: "#8b5cf6", // Violet
    description: "CHoCH+ is a premium structural signal that indicates a highly reliable trend reversal. It consists of an initial Change of Character (CHoCH) followed immediately by a secondary structure break (BOS) in the new direction, filtering out false reversals.",
    concepts: [
      "Double structure break validation",
      "Reversal filter for volatile sessions",
      "High probability trend reversal confirmation"
    ],
    rules: [
      "Wait for the initial CHoCH (break of the last swing level in the old trend).",
      "Wait for the price to pull back to form a new lower high (in a bearish shift).",
      "Wait for the price to break down once more, creating a new swing low (BOS in the new trend).",
      "This secondary break forms the CHoCH+ pattern. Enter on the subsequent mitigation."
    ],
    pineCodeSnippet: `//@version=5
indicator("Flux - CHoCH+", overlay=true)
// Standard structure logic
var int trend_direction = 0 // 1: Bull, -1: Bear
var bool choch_triggered = false

// Check for CHoCH, then look for subsequent BOS to trigger CHoCH+
isCHoCH_Plus = false // Custom double break logic here
plotshape(isCHoCH_Plus, "CHoCH+", shape.labeldown, location.abovebar, color.red, text="CHoCH+")`
  },

  // --- GAPS & BLOCKS ---
  {
    id: "fvg",
    category: "gaps-blocks",
    title: "Fair Value Gap (FVG)",
    subtitle: "3-Candle Market Imbalance",
    difficulty: "Beginner",
    color: "#f59e0b", // Amber
    description: "A Fair Value Gap is created when a high-momentum expansion candle causes an imbalance in price. It is defined by a three-candle sequence where there is a gap between the high of the first candle and the low of the third candle.",
    concepts: [
      "Market inefficiency / imbalance",
      "Liquid magnet (price seeks to retrace and fill the gap)",
      "Consequent Encroachment (50% midpoint of the gap)"
    ],
    rules: [
      "Locate a very large, aggressive candle (Candle 2).",
      "Check the high of the preceding candle (Candle 1) and the low of the following candle (Candle 3).",
      "If Candle 1's high is below Candle 3's low (in a rally), a bullish FVG is present.",
      "Draw a box across this gap. Expect price to retrace and bounce from this zone."
    ],
    pineCodeSnippet: `//@version=5
indicator("Flux - Fair Value Gap (FVG)", overlay=true)
bullish_fvg = low[0] > high[2] and (close[1] - open[1]) > ta.sma(math.abs(close-open), 20) * 1.5

if bullish_fvg
    box.new(left=bar_index[2], top=low[0], right=bar_index, bottom=high[2], 
            bgcolor=color.new(color.yellow, 90), border_color=color.yellow)`
  },
  {
    id: "ifvg",
    category: "gaps-blocks",
    title: "Inversion Fair Value Gap (IFVG)",
    subtitle: "Imbalance Support/Resistance Flip",
    difficulty: "Advanced",
    color: "#3b82f6", // Sky Blue
    description: "An Inversion Fair Value Gap occurs when an existing FVG fails to support or resist price and is cleanly broken. Once price closes completely through a FVG, that zone flips character—becoming support (if it was resistance) or resistance (if it was support).",
    concepts: [
      "S/R flip applied to structural imbalances",
      "Invalidated FVG zones acting as magnets",
      "Stop-triggering price actions"
    ],
    rules: [
      "Identify an active FVG on your chart.",
      "Wait for the price to aggressively close past the opposite boundary of the FVG box.",
      "Upon a successful body close, re-label the zone as an Inversion FVG (IFVG).",
      "Look for entry opportunities when the price retraces to test the IFVG boundary."
    ],
    pineCodeSnippet: `//@version=5
indicator("Flux - Inversion FVG (IFVG)", overlay=true)
// Detect FVG, check if price crosses and closes on the opposite side
// Set flipped resistance/support box
plot(na)`
  },
  {
    id: "ob",
    category: "gaps-blocks",
    title: "Order Block (OB)",
    subtitle: "Institutional Footprint Zones",
    difficulty: "Intermediate",
    color: "#10b981", // Emerald
    description: "An Order Block represents a zone where major institutions have placed large, block-buy or block-sell orders. It is typically defined as the last opposite-colored candle (down-close before a rally, up-close before a drop) that preceded a major breakout.",
    concepts: [
      "Unfilled institutional order clustering",
      "Mitigated (tested) vs. Unmitigated (untested) blocks",
      "High volume displacement origin"
    ],
    rules: [
      "Locate a strong expansion move that breaks market structure (BOS/CHoCH).",
      "Identify the last opposite-colored candle that occurred right before that expansion leg started.",
      "Draw a zone across the body (or wicks) of this candle. This is your Order Block.",
      "Wait for price to pull back to this block for a limit-order entry."
    ],
    pineCodeSnippet: `//@version=5
indicator("Flux - Order Block Finder", overlay=true)
isBullishOB = close > open and close[1] < open[1] and volume > ta.sma(volume, 20)
plotshape(isBullishOB, "OB Support", shape.labelup, location.belowbar, color.green, text="OB")`
  },
  {
    id: "bb",
    category: "gaps-blocks",
    title: "Breaker Block (BB)",
    subtitle: "Failed Order Block Support/Resistance Flip",
    difficulty: "Intermediate",
    color: "#ef4444", // Red
    description: "A Breaker Block is a failed Order Block. When price crashes cleanly through an established Order Block, the block is invalidated. However, when price pulls back, this invalidated block flips and acts as a strong reversal pivot from the opposite side.",
    concepts: [
      "Invalidated institutional order levels",
      "Order Block S/R transition",
      "Stop hunts resulting in new trend pivots"
    ],
    rules: [
      "Locate an active Order Block that has not been mitigated.",
      "Wait for the price to aggressively break straight through the Order Block with body closes.",
      "Wait for the price to retrace and tap the outer edge of this broken block.",
      "Enter a trade in the direction of the break, using the Breaker Block as the pivot anchor."
    ],
    pineCodeSnippet: `//@version=5
indicator("Flux - Breaker Block (BB)", overlay=true)
// Check if a bullish OB gets broken by a bearish close below its bottom boundary
// Draw breaker block zone at that flipped level
plot(na)`
  },
  {
    id: "volume-imbalance",
    category: "gaps-blocks",
    title: "Volume Imbalance",
    subtitle: "Body-to-Body Session Gap",
    difficulty: "Advanced",
    color: "#ec4899", // Pink
    description: "A Volume Imbalance occurs when a gap exists between the close of one candle and the open of the next candle. The wicks of the candles might overlap, but no actual trading body overlaps, leaving a thin spot in price delivery that acts as a support or resistance level.",
    concepts: [
      "No candle body overlap within a price zone",
      "Occurs during high volatility or session gaps",
      "Acts as a short-term magnet and support/resistance"
    ],
    rules: [
      "Look for adjacent candles where a gap exists between the close of Candle 1 and open of Candle 2.",
      "Verify if the wicks overlap. If wicks overlap but bodies do not, it is a Volume Imbalance.",
      "Draw a boundary box between the close of Candle 1 and open of Candle 2.",
      "Trade reversals or continuations when the price fills this body gap."
    ],
    pineCodeSnippet: `//@version=5
indicator("Flux - Volume Imbalance", overlay=true)
isVI_Bull = open > close[1] // Gap open
// Draw box between close[1] and open[0]`
  },

  // --- LIQUIDITY ---
  {
    id: "liquidity-grab",
    category: "liquidity",
    title: "Liquidity Grab (Sweep)",
    subtitle: "Stop Loss Hunt Mitigation",
    difficulty: "Intermediate",
    color: "#a855f7", // Purple
    description: "Liquidity Grabs occur when smart money drives price past a visible key swing high or swing low to trigger retail stop-losses (generating counterparty liquidity), before immediately reversing the price in the true intended direction.",
    concepts: [
      "Stop hunting at major swing wicks",
      "Swing Failure Patterns (SFP)",
      "Triggering buy/sell stops to gather orders"
    ],
    rules: [
      "Identify a major swing high or swing low.",
      "Wait for price to shoot past that level, triggering stops.",
      "Look for the candle to fail to close past the level, leaving a long wick (rejection).",
      "Enter immediately in the direction of the rejection on the candle close."
    ],
    pineCodeSnippet: `//@version=5
indicator("Flux - Liquidity Grab (SFP)", overlay=true)
swingL = ta.lowest(low, 20)
isSweep = low < swingL[1] and close > swingL[1]
plotchar(isSweep, "Sweep", "🧹", location.belowbar, color.purple)`
  },
  {
    id: "bsl",
    category: "liquidity",
    title: "Buyside Liquidity (BSL)",
    subtitle: "Short Seller Stop Loss Pools",
    difficulty: "Beginner",
    color: "#f43f5e", // Rose
    description: "Buyside Liquidity represents a concentration of buy stop-orders resting above key swing highs. These stop-losses from short-sellers act as a magnet for institutional algorithms seeking buyers to fill their own sell block orders.",
    concepts: [
      "Short-seller stop pools",
      "Breakout buyer trap zones",
      "Price magnets above resistance peaks"
    ],
    rules: [
      "Locate prominent swing highs or double tops.",
      "Mark the area above these highs as Buyside Liquidity (BSL).",
      "Anticipate a sweep of this pool before a bearish reversal occurs.",
      "Look for bearish wicks or shifts in lower timeframe structure after BSL is cleared."
    ],
    pineCodeSnippet: `//@version=5
indicator("Flux - Buyside Liquidity (BSL)", overlay=true)
ph = ta.pivothigh(high, 10, 10)
plot(ph, "BSL Level", color.red, 1, plot.style_linebreak)`
  },
  {
    id: "ssl",
    category: "liquidity",
    title: "Sellside Liquidity (SSL)",
    subtitle: "Long Buyer Stop Loss Pools",
    difficulty: "Beginner",
    color: "#6366f1", // Indigo
    description: "Sellside Liquidity is a concentration of sell stop-orders resting below key swing lows. These stop-losses from buyers act as a market magnet, providing the sell volume institutions need to execute large block-buy positions.",
    concepts: [
      "Long buyer stop pools",
      "Breakout seller trap zones",
      "Price magnets below support troughs"
    ],
    rules: [
      "Locate prominent swing lows or double bottoms.",
      "Mark the area below these lows as Sellside Liquidity (SSL).",
      "Anticipate a sweep of this pool before a bullish reversal occurs.",
      "Look for bullish wicks or shifts in lower timeframe structure after SSL is swept."
    ],
    pineCodeSnippet: `//@version=5
indicator("Flux - Sellside Liquidity (SSL)", overlay=true)
pl = ta.pivotlow(low, 10, 10)
plot(pl, "SSL Level", color.blue, 1, plot.style_linebreak)`
  },
  {
    id: "eqh",
    category: "liquidity",
    title: "Equal Highs (EQH)",
    subtitle: "Retail Double Top Resistance",
    difficulty: "Beginner",
    color: "#f43f5e", // Rose
    description: "Equal Highs represent a double top pattern where retail traders see a strong resistance barrier. This concentration of resistance results in a massive pool of buy-stop liquidity resting just above it, making it a primary target for stop-hunts.",
    concepts: [
      "Retail double top resistance",
      "Heavy buy-stop concentration above equal peaks",
      "High probability sweep targets"
    ],
    rules: [
      "Identify two or more swing highs peaking at nearly the same price level.",
      "Mark the level above these peaks as Equal Highs (EQH) Liquidity.",
      "Avoid entering short positions directly at this resistance, expecting a sweep.",
      "Wait for a volatility spike to clear the EQH level before looking for reversal setups."
    ],
    pineCodeSnippet: `//@version=5
indicator("Flux - Equal Highs (EQH)", overlay=true)
threshold = 0.05 // % difference
ph1 = ta.pivothigh(high, 5, 5)
// Check if consecutive pivot highs are within threshold
plot(na)`
  },
  {
    id: "eql",
    category: "liquidity",
    title: "Equal Lows (EQL)",
    subtitle: "Retail Double Bottom Support",
    difficulty: "Beginner",
    color: "#6366f1", // Indigo
    description: "Equal Lows represent a double bottom pattern. Because retail traders set their stop-losses just below support wicks, equal lows create a massive concentration of sellside stop orders (SSL) that market makers target to fill their own orders.",
    concepts: [
      "Retail double bottom support",
      "Heavy sell-stop concentration below equal troughs",
      "High probability stop-run targets"
    ],
    rules: [
      "Identify two or more swing lows bottoming out at nearly the same price level.",
      "Mark the level below these troughs as Equal Lows (EQL) Liquidity.",
      "Avoid buying directly at this support, expecting a sweep of the stops.",
      "Wait for price to trigger the stops below the EQL before initiating long positions."
    ],
    pineCodeSnippet: `//@version=5
indicator("Flux - Equal Lows (EQL)", overlay=true)
// Check if consecutive pivot lows are within % threshold
plot(na)`
  },
  {
    id: "trendlines",
    category: "liquidity",
    title: "Trendlines",
    subtitle: "Diagonal Retail Support & Resistance",
    difficulty: "Intermediate",
    color: "#eab308", // Yellow
    description: "Trendlines connect consecutive swing points diagonally. Retail traders place stop-losses along these trendlines, creating a diagonal trail of liquidity. Smart money algorithms target and sweep this trail, resulting in trendline break reversals.",
    concepts: [
      "Diagonal support/resistance liquidity trails",
      "Retail trendline breakout trap setups",
      "Trendline sweeps before trend continuation"
    ],
    rules: [
      "Draw a diagonal trendline connecting two or more swing points.",
      "Recognize that as the trendline is tapped more often, the liquidity pool beneath it grows.",
      "Wait for a sudden, high-momentum breakout that triggers the wicks past the trendline.",
      "Look for a rapid reclaim of the trendline to confirm a liquidity sweep."
    ],
    pineCodeSnippet: `//@version=5
indicator("Flux - Trendline Liquidity", overlay=true)
// Auto-trendline script
plot(na)`
  },

  // --- ADVANCED ---
  {
    id: "premium-discount",
    category: "advanced",
    title: "Premium & Discount Zones",
    subtitle: "Fibonacci Range Equilibrium",
    difficulty: "Intermediate",
    color: "#0ea5e9", // Sky Blue
    description: "Premium and Discount Zones divide a trading range in half at the 50% Equilibrium level. To buy at a cheap price, traders look for setups in the Discount Zone (< 50%). To sell at an expensive price, they look for setups in the Premium Zone (> 50%).",
    concepts: [
      "0.5 Equilibrium level division",
      "Buying cheap (Discount) vs. Selling expensive (Premium)",
      "Fibonacci retracement utility"
    ],
    rules: [
      "Define a complete trading swing range from Swing Low (0%) to Swing High (100%).",
      "Mark the 50% midpoint line as the Equilibrium.",
      "Only execute long entries when price is trading in the Discount Zone (below 50%).",
      "Only execute short entries when price is trading in the Premium Zone (above 50%)."
    ],
    pineCodeSnippet: `//@version=5
indicator("Flux - Premium/Discount", overlay=true)
h = ta.highest(high, 20)
l = ta.lowest(low, 20)
mid = (h + l) / 2
plot(mid, "Equilibrium", color.orange)`
  },
  {
    id: "mtf-high-low",
    category: "advanced",
    title: "MTF Highs and Lows",
    subtitle: "Higher Timeframe Session Borders",
    difficulty: "Intermediate",
    color: "#f97316", // Orange
    description: "Multi-Timeframe Highs and Lows plot the high and low prices of higher timeframes (such as Daily, Weekly, or Monthly) onto lower-timeframe charts (such as the 5m or 15m). These levels act as major historical support and resistance pivot zones.",
    concepts: [
      "Daily / Weekly high & low level mapping",
      "Higher timeframe key S/R levels on lower timeframe charts",
      "Volatility trigger levels"
    ],
    rules: [
      "Load a lower-timeframe chart (e.g. 5m or 15m).",
      "Enable MTF overlays to project the previous day's high (PDH) and low (PDL).",
      "Treat these levels as highly reactive support and resistance areas.",
      "Look for liquidity sweeps or order blocks forming exactly at these MTF horizontal levels."
    ],
    pineCodeSnippet: `//@version=5
indicator("Flux - MTF Highs/Lows", overlay=true)
pdh = request.security(syminfo.tickerid, "D", high[1])
pdl = request.security(syminfo.tickerid, "D", low[1])
plot(pdh, "Prev Daily High", color.red)
plot(pdl, "Prev Daily Low", color.blue)`
  },
  {
    id: "sessions",
    category: "advanced",
    title: "Sessions & Ranges",
    subtitle: "Time-Based Liquidity Cycles",
    difficulty: "Advanced",
    color: "#06b6d4", // Cyan
    description: "Sessions price action breaks the trading day into color-coded time regions (Asian Session, London Open, New York Open). Highs and lows established during specific sessions act as major liquidity pools that are often swept in subsequent sessions.",
    concepts: [
      "Session range box projections",
      "Asian session range sweeps during London Open",
      "New York session continuation or reversal pivots"
    ],
    rules: [
      "Color-code your chart based on Tokyo (Asian), London, and New York sessions.",
      "Mark the highs and lows of the Asian session (usually a tight consolidation).",
      "Wait for the London Open to spike and sweep the Asian session high or low.",
      "Enter a reversal trade in London based on the Asian range sweep."
    ],
    pineCodeSnippet: `//@version=5
indicator("Flux - Sessions Overlay", overlay=true)
is_asia = not na(time(timeframe.period, "0000-0800:23456"))
bgcolor(is_asia ? color.new(color.blue, 95) : na)`
  },
  {
    id: "mtf-analysis",
    category: "advanced",
    title: "Multi-Timeframe Analysis",
    subtitle: "High-Timeframe Bias to Low-Timeframe Execution",
    difficulty: "Advanced",
    color: "#f43f5e", // Rose
    description: "Multi-Timeframe Analysis coordinates analysis across different timeframes. The trader uses a Higher Timeframe (e.g., 4H or Daily) to establish overall trend bias and locate major key levels, and then zooms in to a Lower Timeframe (e.g., 1m to 15m) to find precise entry signals.",
    concepts: [
      "HTF trend bias identification",
      "LTF entry refinement",
      "Noise filtering across intervals"
    ],
    rules: [
      "Analyze the higher timeframe (e.g., 4H) to find the primary trend (Bullish/Bearish).",
      "Locate the key 4H level (e.g., a 4H Order Block or 4H FVG).",
      "Wait for price on the lower timeframe (e.g., 15m) to pull back into that 4H zone.",
      "Look for an LTF CHoCH or FVG inside that zone to execute a low-risk entry."
    ],
    pineCodeSnippet: `//@version=5
indicator("Flux - MTF Bias Coordinator", overlay=true)
htf_trend = request.security(syminfo.tickerid, "240", ta.ema(close, 50))
plot(htf_trend, "4H EMA Bias", color.purple, 2)`
  },
  {
    id: "alerts",
    category: "advanced",
    title: "Automated Signals & Alerts",
    subtitle: "Real-Time Price Action Notifications",
    difficulty: "Beginner",
    color: "#fb923c", // Orange
    description: "Automated alerts connect price action conditions—such as a Break of Structure, an Order Block mitigation, or a Liquidity Sweep—to instant push notifications, enabling traders to react to setups without staring at charts constantly.",
    concepts: [
      "Pine Script alert condition binding",
      "Real-time push notifications",
      "Multi-concept alert triggers"
    ],
    rules: [
      "Identify the core price action trigger (e.g., a bullish BOS).",
      "Define an alert condition within your script's code block.",
      "Set up your TradingView chart alert to trigger once per bar close.",
      "Configure notifications to send via SMS, email, or Webhooks (e.g. Telegram/Discord)."
    ],
    pineCodeSnippet: `//@version=5
indicator("Flux - Automated Price Action Alerts", overlay=true)
// Alarm triggers
alert_msg = "Bullish Price Action setup detected!"
if (ta.crossover(close, ta.highest(high[1], 10)))
    alert(alert_msg, alert.freq_once_per_bar_close)`
  }
];

export default function Strategies() {
  const [activeCategory, setActiveCategory] = useState("structure");
  
  // Filter strategies based on active tab category
  const filteredStrategies = STRATEGIES_DATA.filter(strat => strat.category === activeCategory);
  
  const [selectedStrategy, setSelectedStrategy] = useState(filteredStrategies[0] || STRATEGIES_DATA[0]);
  const [copied, setCopied] = useState(false);

  // Sync selected strategy when active category changes
  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    const categoryFirstItem = STRATEGIES_DATA.find(strat => strat.category === catId);
    if (categoryFirstItem) {
      setSelectedStrategy(categoryFirstItem);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render responsive SVG diagrams dynamically to explain each concept
  const renderSVGDiagram = (id, color) => {
    const bgDark = "#080a10";
    const lineGrid = "rgba(255,255,255,0.03)";
    const bullishColor = "#10b981";
    const bearishColor = "#ef4444";
    const structureColor = "#0ea5e9";
    const annotationColor = "#94a3b8";

    switch (id) {
      case "bos":
        return (
          <svg viewBox="0 0 400 220" style={stratStyles.svgCanvas}>
            <rect width="100%" height="100%" fill={bgDark} rx="12" />
            <line x1="0" y1="55" x2="400" y2="55" stroke={lineGrid} />
            <line x1="0" y1="110" x2="400" y2="110" stroke={lineGrid} />
            <line x1="0" y1="165" x2="400" y2="165" stroke={lineGrid} />
            {/* Uptrend Zigzag path */}
            <polyline points="40,175 100,110 140,140 220,55 260,95 340,30" 
                      fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
            {/* Swing High Level line */}
            <line x1="100" y1="110" x2="230" y2="110" stroke={structureColor} strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="100" cy="110" r="4" fill={structureColor} />
            {/* BOS breakout point */}
            <circle cx="192" cy="110" r="6" fill={bullishColor} />
            <line x1="192" y1="110" x2="192" y2="70" stroke={bullishColor} strokeWidth="1.5" />
            <polygon points="188,70 196,70 192,62" fill={bullishColor} />
            {/* Secondary BOS */}
            <line x1="220" y1="55" x2="320" y2="55" stroke={structureColor} strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="220" cy="55" r="4" fill={structureColor} />
            <circle cx="314" cy="55" r="6" fill={bullishColor} />
            {/* Text Labels */}
            <text x="110" y="100" fill={structureColor} fontSize="10" fontWeight="bold">Old Swing High</text>
            <text x="160" y="128" fill={bullishColor} fontSize="11" fontWeight="bold">BOS (Body Close)</text>
            <text x="230" y="45" fill={structureColor} fontSize="10" fontWeight="bold">New Swing High</text>
            <text x="45" y="195" fill={annotationColor} fontSize="9">Uptrend Starts</text>
            <text x="310" y="210" fill={annotationColor} fontSize="9" textAnchor="end">Flux Charts Structure Model</text>
          </svg>
        );

      case "choch":
        return (
          <svg viewBox="0 0 400 220" style={stratStyles.svgCanvas}>
            <rect width="100%" height="100%" fill={bgDark} rx="12" />
            <line x1="0" y1="55" x2="400" y2="55" stroke={lineGrid} />
            <line x1="0" y1="110" x2="400" y2="110" stroke={lineGrid} />
            <line x1="0" y1="165" x2="400" y2="165" stroke={lineGrid} />
            {/* Uptrend to Reversal Zigzag path */}
            <polyline points="40,150 90,95 130,120 180,60 210,85 270,45 320,160 360,130" 
                      fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
            {/* Critical Higher Low level line */}
            <line x1="210" y1="85" x2="330" y2="85" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="210" cy="85" r="4" fill="#fb923c" />
            {/* Reversal Break Point */}
            <circle cx="295" cy="85" r="6" fill={bearishColor} />
            <line x1="295" y1="85" x2="295" y2="125" stroke={bearishColor} strokeWidth="1.5" />
            <polygon points="291,125 299,125 295,133" fill={bearishColor} />
            {/* Text Labels */}
            <text x="130" y="80" fill="#fb923c" fontSize="10" fontWeight="bold">Key Higher Low (HL)</text>
            <text x="305" y="105" fill={bearishColor} fontSize="11" fontWeight="bold">CHoCH Reversal</text>
            <text x="270" y="32" fill={annotationColor} fontSize="10" fontWeight="bold">Highest High (HH)</text>
            <text x="310" y="210" fill={annotationColor} fontSize="9" textAnchor="end">Flux Charts Reversal Model</text>
          </svg>
        );

      case "choch-plus":
        return (
          <svg viewBox="0 0 400 220" style={stratStyles.svgCanvas}>
            <rect width="100%" height="100%" fill={bgDark} rx="12" />
            <line x1="0" y1="55" x2="400" y2="55" stroke={lineGrid} />
            <polyline points="40,120 90,70 130,95 180,45 230,130 260,110 320,185 360,160" 
                      fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
            {/* CHoCH break */}
            <line x1="130" y1="95" x2="240" y2="95" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="205" cy="95" r="5" fill="#fb923c" />
            <text x="175" y="85" fill="#fb923c" fontSize="9" fontWeight="bold">1. CHoCH</text>
            {/* Pullback and secondary BOS (CHoCH+) */}
            <line x1="230" y1="130" x2="310" y2="130" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="277" cy="130" r="5" fill={color} />
            <text x="285" y="125" fill={color} fontSize="10" fontWeight="bold">2. CHoCH+ Reversal</text>
            <text x="310" y="210" fill={annotationColor} fontSize="9" textAnchor="end">Flux Double-Break confirmation</text>
          </svg>
        );

      case "fvg":
        return (
          <svg viewBox="0 0 400 220" style={stratStyles.svgCanvas}>
            <rect width="100%" height="100%" fill={bgDark} rx="12" />
            {/* Candle 1 (Bullish) */}
            <line x1="70" y1="110" x2="70" y2="180" stroke={bullishColor} strokeWidth="2" />
            <rect x="60" y="125" width="20" height="40" fill={bullishColor} stroke={bullishColor} />
            {/* Candle 2 (High Displacement Bullish Expansion) */}
            <line x1="130" y1="50" x2="130" y2="200" stroke={bullishColor} strokeWidth="2" />
            <rect x="120" y="70" width="20" height="110" fill={bullishColor} stroke={bullishColor} />
            {/* Candle 3 (Bullish) */}
            <line x1="190" y1="30" x2="190" y2="110" stroke={bullishColor} strokeWidth="2" />
            <rect x="180" y="45" width="20" height="45" fill={bullishColor} stroke={bullishColor} />
            {/* FVG Highlight Box */}
            <rect x="70" y="90" width="260" height="35" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
            <text x="210" y="112" fill="#f59e0b" fontSize="11" fontWeight="bold">Fair Value Gap (FVG)</text>
            {/* Annotations */}
            <line x1="70" y1="125" x2="200" y2="125" stroke={annotationColor} strokeWidth="1" strokeDasharray="2 2" />
            <text x="210" y="129" fill={annotationColor} fontSize="8">Candle 1 High</text>
            <line x1="190" y1="90" x2="310" y2="90" stroke={annotationColor} strokeWidth="1" strokeDasharray="2 2" />
            <text x="235" y="86" fill={annotationColor} fontSize="8">Candle 3 Low</text>
            <text x="310" y="210" fill={annotationColor} fontSize="9" textAnchor="end">Flux Inefficiency Model</text>
          </svg>
        );

      case "ifvg":
        return (
          <svg viewBox="0 0 400 220" style={stratStyles.svgCanvas}>
            <rect width="100%" height="100%" fill={bgDark} rx="12" />
            {/* Broken FVG Box */}
            <rect x="40" y="80" width="320" height="40" fill="rgba(59, 130, 246, 0.1)" stroke={color} strokeWidth="1" strokeDasharray="3 3" />
            <text x="140" y="105" fill={color} fontSize="11" fontWeight="bold">Inversion FVG (IFVG)</text>
            {/* Price path falling below, retesting underside and getting rejected */}
            <path d="M 50,40 L 120,65 L 180,150 L 250,120 L 320,180" 
                  fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
            {/* Rejection marker */}
            <circle cx="250" cy="120" r="5" fill={bearishColor} />
            <line x1="250" y1="120" x2="290" y2="155" stroke={bearishColor} strokeWidth="2" />
            <polygon points="288,157 292,151 294,159" fill={bearishColor} />
            <text x="240" y="142" fill={bearishColor} fontSize="9" fontWeight="bold">IFVG Rejection</text>
            <text x="50" y="210" fill={annotationColor} fontSize="9">Price breaks through, tests opposite side</text>
          </svg>
        );

      case "ob":
        return (
          <svg viewBox="0 0 400 220" style={stratStyles.svgCanvas}>
            <rect width="100%" height="100%" fill={bgDark} rx="12" />
            {/* Down close candle (OB) */}
            <line x1="80" y1="100" x2="80" y2="180" stroke={bearishColor} strokeWidth="2" />
            <rect x="70" y="120" width="20" height="50" fill={bearishColor} stroke={bearishColor} />
            <text x="45" y="115" fill={bearishColor} fontSize="9" fontWeight="bold">Last Down-Close</text>
            {/* Strong bullish expansion */}
            <line x1="140" y1="40" x2="140" y2="190" stroke={bullishColor} strokeWidth="2" />
            <rect x="130" y="55" width="20" height="120" fill={bullishColor} stroke={bullishColor} />
            {/* Order Block projection box */}
            <rect x="90" y="120" width="260" height="50" fill="rgba(16, 185, 129, 0.12)" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="190" y="150" fill={color} fontSize="11" fontWeight="bold">Bullish Order Block (OB)</text>
            {/* Pullback path to tap and rally */}
            <path d="M 160,70 L 220,95 L 260,135 L 340,65" 
                  fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
            {/* Tapping point */}
            <circle cx="260" cy="135" r="5" fill={color} />
            <text x="260" y="125" fill={color} fontSize="9" fontWeight="bold">Mitigation (Tap)</text>
            <text x="310" y="210" fill={annotationColor} fontSize="9" textAnchor="end">Flux Institutional Block Model</text>
          </svg>
        );

      case "bb":
        return (
          <svg viewBox="0 0 400 220" style={stratStyles.svgCanvas}>
            <rect width="100%" height="100%" fill={bgDark} rx="12" />
            {/* Failed OB zone */}
            <rect x="40" y="60" width="320" height="40" fill="rgba(239, 68, 68, 0.1)" stroke={color} strokeWidth="1" strokeDasharray="3 3" />
            <text x="140" y="85" fill={color} fontSize="11" fontWeight="bold">Bearish Breaker Block (BB)</text>
            {/* Price path breaking down, returning to test underside */}
            <path d="M 50,120 L 120,70 L 190,140 L 260,85 L 320,50" 
                  fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
            {/* Retest point */}
            <circle cx="260" cy="85" r="5" fill={color} />
            <text x="230" y="75" fill={color} fontSize="9" fontWeight="bold">Flipped resistance tap</text>
            <text x="50" y="210" fill={annotationColor} fontSize="9">Broken support block acts as resistance flip</text>
          </svg>
        );

      case "volume-imbalance":
        return (
          <svg viewBox="0 0 400 220" style={stratStyles.svgCanvas}>
            <rect width="100%" height="100%" fill={bgDark} rx="12" />
            {/* Candle 1 (red) */}
            <line x1="100" y1="80" x2="100" y2="180" stroke={bearishColor} strokeWidth="2" />
            <rect x="90" y="100" width="20" height="60" fill={bearishColor} stroke={bearishColor} />
            {/* Candle 2 (green, opening with gap) */}
            <line x1="200" y1="30" x2="200" y2="120" stroke={bullishColor} strokeWidth="2" />
            <rect x="190" y="45" width="20" height="45" fill={bullishColor} stroke={bullishColor} />
            {/* Gap box */}
            <rect x="90" y="90" width="220" height="10" fill="rgba(236, 72, 153, 0.15)" stroke={color} strokeWidth="1" strokeDasharray="3 3" />
            <text x="130" y="83" fill={color} fontSize="9" fontWeight="bold">Volume Imbalance (Body Gap)</text>
            <text x="310" y="210" fill={annotationColor} fontSize="9" textAnchor="end">Flux Volume Inefficiency Model</text>
          </svg>
        );

      case "liquidity-grab":
        return (
          <svg viewBox="0 0 400 220" style={stratStyles.svgCanvas}>
            <rect width="100%" height="100%" fill={bgDark} rx="12" />
            <polyline points="40,110 100,150 160,80 220,150 280,185 340,60" 
                      fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
            {/* Support line */}
            <line x1="100" y1="150" x2="310" y2="150" stroke={annotationColor} strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="100" cy="150" r="4" fill={annotationColor} />
            {/* The Grab Wick */}
            <circle cx="280" cy="185" r="5" fill={color} />
            <line x1="280" y1="150" x2="280" y2="185" stroke={color} strokeWidth="2" />
            <text x="210" y="175" fill={color} fontSize="11" fontWeight="bold">Liquidity Sweep</text>
            <text x="100" y="138" fill={annotationColor} fontSize="9">Swing Low Support</text>
            <text x="310" y="210" fill={annotationColor} fontSize="9" textAnchor="end">Flux Swing Failure Model</text>
          </svg>
        );

      case "bsl":
        return (
          <svg viewBox="0 0 400 220" style={stratStyles.svgCanvas}>
            <rect width="100%" height="100%" fill={bgDark} rx="12" />
            <polyline points="40,150 100,60 160,130 220,60 280,120 340,30" 
                      fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
            {/* BSL level line */}
            <line x1="100" y1="60" x2="350" y2="60" stroke={color} strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="100" cy="60" r="4" fill={color} />
            <text x="120" y="52" fill={color} fontSize="11" fontWeight="bold">Buyside Liquidity (BSL)</text>
            <text x="140" y="72" fill={annotationColor} fontSize="8">Retail Short Stops Resting Here</text>
            <text x="310" y="210" fill={annotationColor} fontSize="9" textAnchor="end">Flux Liquidity Map</text>
          </svg>
        );

      case "ssl":
        return (
          <svg viewBox="0 0 400 220" style={stratStyles.svgCanvas}>
            <rect width="100%" height="100%" fill={bgDark} rx="12" />
            <polyline points="40,60 100,160 160,90 220,160 280,100 340,190" 
                      fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
            {/* SSL level line */}
            <line x1="100" y1="160" x2="350" y2="160" stroke={color} strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="100" cy="160" r="4" fill={color} />
            <text x="120" y="152" fill={color} fontSize="11" fontWeight="bold">Sellside Liquidity (SSL)</text>
            <text x="140" y="176" fill={annotationColor} fontSize="8">Retail Buyer Stop-Losses Resting Here</text>
            <text x="310" y="210" fill={annotationColor} fontSize="9" textAnchor="end">Flux Liquidity Map</text>
          </svg>
        );

      case "eqh":
        return (
          <svg viewBox="0 0 400 220" style={stratStyles.svgCanvas}>
            <rect width="100%" height="100%" fill={bgDark} rx="12" />
            <polyline points="40,140 100,70 160,110 220,70 280,120 340,40" 
                      fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
            {/* Equal Highs line */}
            <line x1="100" y1="70" x2="260" y2="70" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="100" cy="70" r="4" fill={color} />
            <circle cx="220" cy="70" r="4" fill={color} />
            <text x="125" y="60" fill={color} fontSize="10" fontWeight="bold">Equal Highs (EQH)</text>
            <text x="120" y="84" fill={annotationColor} fontSize="8">Double Top Resistance / Stop Pool</text>
            <text x="310" y="210" fill={annotationColor} fontSize="9" textAnchor="end">Flux Stop Hunt Targets</text>
          </svg>
        );

      case "eql":
        return (
          <svg viewBox="0 0 400 220" style={stratStyles.svgCanvas}>
            <rect width="100%" height="100%" fill={bgDark} rx="12" />
            <polyline points="40,80 100,150 160,110 220,150 280,100 340,180" 
                      fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
            {/* Equal Lows line */}
            <line x1="100" y1="150" x2="260" y2="150" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="100" cy="150" r="4" fill={color} />
            <circle cx="220" cy="150" r="4" fill={color} />
            <text x="125" y="142" fill={color} fontSize="10" fontWeight="bold">Equal Lows (EQL)</text>
            <text x="120" y="166" fill={annotationColor} fontSize="8">Double Bottom Support / Stop Pool</text>
            <text x="310" y="210" fill={annotationColor} fontSize="9" textAnchor="end">Flux Stop Hunt Targets</text>
          </svg>
        );

      case "trendlines":
        return (
          <svg viewBox="0 0 400 220" style={stratStyles.svgCanvas}>
            <rect width="100%" height="100%" fill={bgDark} rx="12" />
            <polyline points="30,165 90,140 130,150 200,105 240,120 310,75 340,120" 
                      fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
            {/* Diagonal trendline */}
            <line x1="30" y1="165" x2="350" y2="55" stroke={color} strokeWidth="1.5" />
            <circle cx="90" cy="140" r="4" fill={color} />
            <circle cx="200" cy="105" r="4" fill={color} />
            <circle cx="310" cy="75" r="4" fill={color} />
            {/* Sweep point */}
            <circle cx="340" cy="120" r="5" fill={bearishColor} />
            <text x="210" y="125" fill={color} fontSize="10" fontWeight="bold">Trendline Liquidity Pool</text>
            <text x="220" y="140" fill={bearishColor} fontSize="8">Stop Hunt break below trendline</text>
            <text x="310" y="210" fill={annotationColor} fontSize="9" textAnchor="end">Flux Trendline Models</text>
          </svg>
        );

      case "premium-discount":
        return (
          <svg viewBox="0 0 400 220" style={stratStyles.svgCanvas}>
            <rect width="100%" height="100%" fill={bgDark} rx="12" />
            {/* Grid background zones */}
            <rect x="0" y="25" width="400" height="85" fill="rgba(239, 68, 68, 0.05)" />
            <rect x="0" y="110" width="400" height="85" fill="rgba(16, 185, 129, 0.05)" />
            {/* Equilibrium line */}
            <line x1="0" y1="110" x2="400" y2="110" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 5" />
            <polyline points="40,180 120,50 200,160 280,35" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
            {/* Labels */}
            <text x="20" y="60" fill={bearishColor} fontSize="12" fontWeight="bold">PREMIUM ZONE (Shorts)</text>
            <text x="20" y="160" fill={bullishColor} fontSize="12" fontWeight="bold">DISCOUNT ZONE (Buys)</text>
            <text x="280" y="105" fill="#f59e0b" fontSize="10" fontWeight="bold">Equilibrium (0.50)</text>
            <text x="310" y="210" fill={annotationColor} fontSize="9" textAnchor="end">Flux Premium / Discount Grid</text>
          </svg>
        );

      case "mtf-high-low":
        return (
          <svg viewBox="0 0 400 220" style={stratStyles.svgCanvas}>
            <rect width="100%" height="100%" fill={bgDark} rx="12" />
            {/* Daily High level */}
            <line x1="0" y1="50" x2="400" y2="50" stroke={color} strokeWidth="2" />
            <text x="20" y="42" fill={color} fontSize="10" fontWeight="bold">Previous Daily High (PDH)</text>
            {/* Daily Low level */}
            <line x1="0" y1="170" x2="400" y2="170" stroke="#3b82f6" strokeWidth="2" />
            <text x="20" y="185" fill="#3b82f6" fontSize="10" fontWeight="bold">Previous Daily Low (PDL)</text>
            {/* Lower timeframe price action */}
            <polyline points="40,110 100,150 140,80 180,165 240,60 290,168" 
                      fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            {/* Reacting points */}
            <circle cx="290" cy="168" r="5" fill={bullishColor} />
            <text x="240" y="160" fill={bullishColor} fontSize="9" fontWeight="bold">PDL Bounce</text>
            <text x="310" y="210" fill={annotationColor} fontSize="9" textAnchor="end">Flux HTF Levels Model</text>
          </svg>
        );

      case "sessions":
        return (
          <svg viewBox="0 0 400 220" style={stratStyles.svgCanvas}>
            <rect width="100%" height="100%" fill={bgDark} rx="12" />
            {/* Columns */}
            <rect x="20" y="20" width="110" height="170" fill="rgba(14, 165, 233, 0.06)" rx="6" />
            <rect x="140" y="20" width="110" height="170" fill="rgba(234, 179, 8, 0.06)" rx="6" />
            <rect x="260" y="20" width="110" height="170" fill="rgba(34, 197, 94, 0.06)" rx="6" />
            {/* Session Text */}
            <text x="75" y="40" fill="#0ea5e9" fontSize="10" fontWeight="bold" textAnchor="middle">Asian Range</text>
            <text x="195" y="40" fill="#eab308" fontSize="10" fontWeight="bold" textAnchor="middle">London Open</text>
            <text x="315" y="40" fill="#22c55e" fontSize="10" fontWeight="bold" textAnchor="middle">NY Session</text>
            {/* Price Sweep Model */}
            <polyline points="30,120 70,110 110,130 150,150 180,60 230,90 280,65 340,30" 
                      fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
            {/* Asian low sweep by London */}
            <circle cx="150" cy="150" r="5" fill={color} />
            <text x="145" y="165" fill={color} fontSize="9" fontWeight="bold">Asian Low Sweep</text>
            <text x="310" y="210" fill={annotationColor} fontSize="9" textAnchor="end">Flux Time Session Models</text>
          </svg>
        );

      case "mtf-analysis":
        return (
          <svg viewBox="0 0 400 220" style={stratStyles.svgCanvas}>
            <rect width="100%" height="100%" fill={bgDark} rx="12" />
            {/* HTF Trend visual */}
            <line x1="30" y1="180" x2="370" y2="40" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="8" strokeLinecap="round" />
            <text x="320" y="110" fill="rgba(16, 185, 129, 0.4)" fontSize="18" fontWeight="bold">4H BULLISH BIAS</text>
            {/* LTF price action moving within the bias */}
            <polyline points="40,180 80,140 120,165 170,105 210,130 260,75 300,100 350,45" 
                      fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
            {/* Entry signals on wicks */}
            <circle cx="210" cy="130" r="5" fill={color} />
            <circle cx="300" cy="100" r="5" fill={color} />
            <text x="195" y="145" fill={color} fontSize="9" fontWeight="bold">LTF Entry</text>
            <text x="310" y="210" fill={annotationColor} fontSize="9" textAnchor="end">Flux MTF Synchronization</text>
          </svg>
        );

      case "alerts":
        return (
          <svg viewBox="0 0 400 220" style={stratStyles.svgCanvas}>
            <rect width="100%" height="100%" fill={bgDark} rx="12" />
            {/* Signal Chart */}
            <polyline points="40,160 110,90 170,120 250,50 320,110" 
                      fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" />
            <circle cx="250" cy="50" r="6" fill={color} />
            <line x1="250" y1="50" x2="250" y2="90" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Alert Overlay Box */}
            <rect x="70" y="100" width="260" height="70" fill="rgba(13, 15, 23, 0.95)" stroke={color} strokeWidth="1.5" rx="8" />
            <circle cx="100" cy="135" r="16" fill="rgba(251, 146, 60, 0.15)" />
            <path d="M100 127 v10 M100 141 h.01" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <text x="128" y="128" fill="#ffffff" fontSize="10" fontWeight="bold">Flux Price Action Automator</text>
            <text x="128" y="142" fill={annotationColor} fontSize="8">Bullish Break of Structure (BOS) on 15m</text>
            <text x="128" y="154" fill={color} fontSize="8" fontWeight="bold">Notification sent to Telegram!</text>
            <text x="310" y="210" fill={annotationColor} fontSize="9" textAnchor="end">Flux Alert API Model</text>
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 400 220" style={stratStyles.svgCanvas}>
            <rect width="100%" height="100%" fill={bgDark} rx="12" />
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#ffffff">Flux Charts Concept Diagram</text>
          </svg>
        );
    }
  };

  return (
    <div style={stratStyles.container} className="animate-fade-in">
      {/* Ambient Lighting Orbs */}
      <div style={stratStyles.lightOrbLeft} />
      <div style={stratStyles.lightOrbRight} />

      <div className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Page Header */}
        <div style={stratStyles.header}>
          <span className="badge-glow" style={stratStyles.spatialBadge}>Flux Technical Academy</span>
          <h1 style={stratStyles.headerTitle}>Price Action Toolkit</h1>
          <p style={stratStyles.headerSubtitle}>
            The Price Action Toolkit identifies the key core concepts used by professional price action traders, including ICT and Smart Money Mechanics (SMC). Perfect for both beginners and experienced traders seeking to master and automate market structure.
          </p>
        </div>

        {/* Categories Tab Selector */}
        <div style={stratStyles.categoriesRow}>
          {CATEGORIES.map((cat) => {
            const CatIcon = cat.icon;
            const isCatActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                style={{
                  ...stratStyles.categoryTabBtn,
                  backgroundColor: isCatActive ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  borderColor: isCatActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.06)',
                  color: isCatActive ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                <CatIcon size={16} style={{ color: isCatActive ? 'var(--color-primary)' : 'inherit' }} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dashboard Grid */}
        <div style={stratStyles.grid}>
          
          {/* Left Sidebar: Strategy selector list */}
          <div style={stratStyles.sidebar}>
            {filteredStrategies.map((strat) => {
              const isSelected = selectedStrategy.id === strat.id;
              return (
                <div 
                  key={strat.id}
                  onClick={() => setSelectedStrategy(strat)}
                  className="spatial-card-hover"
                  style={{
                    ...stratStyles.sidebarCard,
                    borderColor: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.06)',
                    background: isSelected 
                      ? `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`
                      : 'rgba(255,255,255,0.02)',
                    boxShadow: isSelected 
                      ? `0 12px 30px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.15), 0 0 20px ${strat.color}25` 
                      : '0 4px 20px rgba(0,0,0,0.3)'
                  }}
                >
                  <div style={stratStyles.sidebarCardHeader}>
                    <div style={{ flexGrow: 1 }}>
                      <h3 style={{ fontSize: '0.9rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                        {strat.title}
                      </h3>
                      <span style={{ ...stratStyles.difficultyBadge, color: strat.color }}>{strat.difficulty}</span>
                    </div>
                    <ChevronRight size={18} color="#94a3b8" style={{ marginLeft: 8 }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Detailed content pane formatted as a floating slab */}
          <div 
            className="glass-card" 
            style={{
              ...stratStyles.contentArea,
              boxShadow: `0 30px 60px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.15), 0 0 35px ${selectedStrategy.color}08`
            }}
          >
            {/* Specular light border on top */}
            <div style={stratStyles.specularLine} />

            <div style={stratStyles.contentHeader}>
              <div>
                <h2 style={stratStyles.contentTitle}>{selectedStrategy.title}</h2>
                <span className="badge-glow" style={{ ...stratStyles.contentBadge, borderColor: selectedStrategy.color, color: selectedStrategy.color }}>
                  {selectedStrategy.subtitle}
                </span>
              </div>
              <span style={{ ...stratStyles.statusIndicator, backgroundColor: `${selectedStrategy.color}15`, color: selectedStrategy.color, borderColor: `${selectedStrategy.color}30` }}>
                {selectedStrategy.difficulty}
              </span>
            </div>

            {/* Technical Concept Chart Example */}
            <h4 style={{ ...stratStyles.sectionSubTitle, borderLeftColor: selectedStrategy.color, marginTop: 0 }}>Interactive Chart Example</h4>
            <div style={stratStyles.chartOuterBox}>
              {renderSVGDiagram(selectedStrategy.id, selectedStrategy.color)}
            </div>

            {/* Description */}
            <h4 style={{ ...stratStyles.sectionSubTitle, borderLeftColor: selectedStrategy.color }}>Concept Introduction</h4>
            <p style={stratStyles.strategyDesc}>
              {selectedStrategy.description}
            </p>

            {/* Core Concepts */}
            <h4 style={{ ...stratStyles.sectionSubTitle, borderLeftColor: selectedStrategy.color }}>Core Mechanics</h4>
            <div style={stratStyles.conceptsGrid}>
              {selectedStrategy.concepts.map((concept, idx) => (
                <div key={idx} style={stratStyles.conceptItem}>
                  <div style={{ ...stratStyles.conceptBullet, backgroundColor: `${selectedStrategy.color}20` }}>
                    <CheckCircle size={14} color={selectedStrategy.color} />
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{concept}</span>
                </div>
              ))}
            </div>

            {/* Strategy Rules */}
            <h4 style={{ ...stratStyles.sectionSubTitle, borderLeftColor: selectedStrategy.color }}>Execution Blueprint</h4>
            <div style={stratStyles.rulesList}>
              {selectedStrategy.rules.map((rule, idx) => (
                <div key={idx} style={stratStyles.ruleItem}>
                  <div style={{ ...stratStyles.ruleIndex, background: `linear-gradient(135deg, ${selectedStrategy.color} 0%, rgba(255,255,255,0.1) 100%)` }}>
                    {idx + 1}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>{rule}</p>
                </div>
              ))}
            </div>

            {/* Pine Script Mock Code Box */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, marginBottom: 16 }}>
              <h4 style={{ ...stratStyles.sectionSubTitle, borderLeftColor: selectedStrategy.color, margin: 0 }}>Pine Script (TradingView Automation)</h4>
              <button 
                onClick={() => copyToClipboard(selectedStrategy.pineCodeSnippet)}
                style={stratStyles.copyBtn}
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>
            
            <div style={stratStyles.codeWrapper}>
              <div style={stratStyles.codeHeader}>
                <div style={stratStyles.windowDotRed} />
                <div style={stratStyles.windowDotYellow} />
                <div style={stratStyles.windowDotGreen} />
                <span style={stratStyles.codeTitle}>{selectedStrategy.id}_automator.src</span>
              </div>
              <pre style={stratStyles.pre}>
                <code>{selectedStrategy.pineCodeSnippet}</code>
              </pre>
            </div>
            
            {/* Tips footer block */}
            <div style={{ ...stratStyles.tipsFooter, borderTopColor: 'rgba(255,255,255,0.06)' }}>
              <Info size={18} color={selectedStrategy.color} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>
                Note: Backtest these Price Action setups extensively using historical data before trading. Risk management remains your primary shield in volatile sessions.
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// Add CSS styling dynamically for spatial effects and 3D tilts
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .spatial-card-hover {
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      backdrop-filter: blur(20px);
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .spatial-card-hover:hover {
      transform: translateY(-5px);
      background: rgba(255, 255, 255, 0.06) !important;
      border-color: rgba(255, 255, 255, 0.2) !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.15) !important;
    }
  `;
  document.head.appendChild(styleEl);
}

const stratStyles = {
  container: {
    padding: '40px 0 64px 0',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '100vh',
  },
  lightOrbLeft: {
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.0) 70%)',
    position: 'absolute',
    top: '-100px',
    left: '-150px',
    filter: 'blur(60px)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  lightOrbRight: {
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(14, 165, 233, 0.07) 0%, rgba(14, 165, 233, 0.0) 75%)',
    position: 'absolute',
    bottom: '50px',
    right: '-200px',
    filter: 'blur(80px)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  header: {
    marginBottom: '32px',
  },
  spatialBadge: {
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    fontSize: '0.7rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  },
  headerTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '2.5rem',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    marginTop: '12px',
    color: '#ffffff',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: '1rem',
    marginTop: '6px',
    maxWidth: '800px',
    lineHeight: '1.55',
  },
  categoriesRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '32px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '16px'
  },
  categoryTabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '32px',
    alignItems: 'start',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sidebarCard: {
    padding: '16px 20px',
    cursor: 'pointer',
    borderRadius: '12px',
    backdropFilter: 'blur(20px)',
  },
  sidebarCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  difficultyBadge: {
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '2px',
    display: 'block',
  },
  contentArea: {
    padding: '36px',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(30px)',
    borderRadius: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  specularLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2) 30%, rgba(255,255,255,0.2) 70%, transparent)',
  },
  contentHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '20px',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  contentTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.8rem',
    fontWeight: 800,
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  contentBadge: {
    marginTop: '8px',
    display: 'inline-block',
    textTransform: 'none',
    fontSize: '0.8rem',
    padding: '4px 12px',
    borderRadius: '999px',
  },
  statusIndicator: {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '6px 14px',
    borderRadius: '999px',
    border: '1px solid',
    textTransform: 'uppercase',
  },
  chartOuterBox: {
    backgroundColor: '#05070c',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '28px',
    boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.8)'
  },
  svgCanvas: {
    width: '100%',
    height: 'auto',
    maxHeight: '260px',
    display: 'block'
  },
  strategyDesc: {
    color: '#e2e8f0',
    fontSize: '0.95rem',
    lineHeight: '1.7',
    marginBottom: '28px',
  },
  sectionSubTitle: {
    fontSize: '1rem',
    color: '#ffffff',
    fontWeight: 700,
    borderLeft: '4px solid',
    paddingLeft: '12px',
    margin: '32px 0 16px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  conceptsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '28px',
  },
  conceptItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  conceptBullet: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rulesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '28px',
  },
  ruleItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  ruleIndex: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    color: '#ffffff',
    fontWeight: 800,
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },
  copyBtn: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    color: '#94a3b8',
    padding: '6px 12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.15s ease',
  },
  codeWrapper: {
    backgroundColor: '#050608',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '20px',
    overflowX: 'auto',
    boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.8)',
    position: 'relative',
  },
  codeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    paddingBottom: '12px',
    marginBottom: '14px',
  },
  windowDotRed: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
  },
  windowDotYellow: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#eab308',
  },
  windowDotGreen: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#22c55e',
  },
  codeTitle: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginLeft: '12px',
    fontFamily: 'monospace',
  },
  pre: {
    margin: 0,
    color: '#34d399',
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '0.85rem',
    lineHeight: '1.5',
  },
  tipsFooter: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginTop: '32px',
    borderTop: '1px solid',
    paddingTop: '20px',
  }
};
