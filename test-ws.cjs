require('dotenv').config();
const WebSocket = require('ws');
const WSS_URL = `wss://api-feed.dhan.co?version=2&token=${process.env.DHAN_ACCESS_TOKEN}&clientId=${process.env.DHAN_CLIENT_ID}&authType=2`;

console.log("Connecting to:", WSS_URL.substring(0, 50) + "...");

const ws = new WebSocket(WSS_URL);
ws.on('open', () => {
    console.log('Raw WS OPEN');
    ws.close();
});
ws.on('error', (err) => {
    console.error('Raw WS Error:', err);
});
