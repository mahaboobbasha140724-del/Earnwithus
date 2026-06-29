import * as dhan from 'dhanhq';
import dotenv from 'dotenv';
dotenv.config();

console.log("Client ID:", process.env.DHAN_CLIENT_ID);

async function test() {
  try {
    const dhanObj = new dhan.DhanHqClient({
      clientId: process.env.DHAN_CLIENT_ID,
      accessToken: process.env.DHAN_ACCESS_TOKEN,
      env: dhan.DhanEnv.PROD
    });
    const feed = new dhan.DhanFeed(process.env.DHAN_CLIENT_ID, process.env.DHAN_ACCESS_TOKEN, [
      {
        ExchangeSegment: dhan.ExchangeSegment.NSE_EQ,
        SecurityId: "1333", // HDFCBANK
      }
    ], "Quote");
    
    feed.onConnect = () => {
      console.log("Feed Connected successfully");
      process.exit(0);
    };
    
    feed.onClose = () => {
      console.log("Feed Closed");
    };
    
    console.log("Connecting...");
    feed.connect();
    
    // Wait a bit before exiting
    setTimeout(() => {
      console.log("Timeout waiting for connection");
      process.exit(1);
    }, 5000);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
