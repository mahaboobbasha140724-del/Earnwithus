async function test() {
  try {
    const res = await fetch("https://oxide.sensibull.com/v1/compute/cache/fii_dii_daily", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Origin": "https://web.sensibull.com",
        "Referer": "https://web.sensibull.com/"
      }
    });
    const rawData = await res.json();
    const dates = Object.keys(rawData.data).sort();
    const latestDate = dates[dates.length - 1];
    console.log("Latest date:", latestDate);
    console.log("Cash data:", JSON.stringify(rawData.data[latestDate].cash, null, 2));
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}
test();
