async function verify() {
  try {
    const res = await fetch("http://localhost:3001/api/market/fii-dii");
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Source:", data.source);
    console.log("Date:", data.date);
    console.log("First Flow Segment:", data.flows[0].segment, "Value:", data.flows[0].netValue);
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}
verify();
