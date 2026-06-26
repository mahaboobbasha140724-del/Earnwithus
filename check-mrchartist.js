async function test() {
  try {
    const res = await fetch("https://fii-diidata.mrchartist.com/api/data", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "application/json"
      }
    });
    const data = await res.json();
    console.log("Entire Data Object:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}
test();
