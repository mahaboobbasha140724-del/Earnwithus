import WebSocket from 'ws';
import dotenv from 'dotenv';
dotenv.config();

const WSS_URL_WITH_AUTH = `wss://api-feed.dhan.co?version=2&token=${process.env.DHAN_ACCESS_TOKEN}&clientId=${process.env.DHAN_CLIENT_ID}&authType=2`;

console.log("Connecting to Patched WS:", WSS_URL_WITH_AUTH.substring(0, 70) + "...");
const ws = new WebSocket(WSS_URL_WITH_AUTH);

ws.on('open', () => {
    console.log('WS OPENED successfully!');
    ws.close();
});

ws.on('error', (err) => {
    console.error('WS Error:', err);
});
ws.on('close', (code, reason) => {
    console.log('WS Closed:', code, reason?.toString());
});
