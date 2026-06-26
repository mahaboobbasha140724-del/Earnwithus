async function test() {
  try {
    const res = await fetch("https://web.sensibull.com/api/v1/fii_dii", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json"
      }
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Data keys:", Object.keys(data));
    console.log("Data sample (fii_dii):", data.fii_dii ? data.fii_dii.slice(0, 2) : "no fii_dii field");
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}
test();
