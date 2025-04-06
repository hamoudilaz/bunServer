// import { executeSwap } from './copy.js';
import WebSocket from 'ws';
import { txid } from './handleTx.js';
import dotenv from 'dotenv';
dotenv.config();
let SOL = 'So11111111111111111111111111111111111111112';

const TOKEN = process.env.SYNDICA_TOKEN;

const wsUrl = `wss://api.syndica.io/api-token/${TOKEN}`;
const ws = new WebSocket(wsUrl);

var n_tx = 0;

ws.on('open', function open() {
    console.log('connected to Chainstream API');

    ws.send(JSON.stringify(subscribe));

    setInterval(() => { ws.ping() }, 30000);
});

ws.on('message', async function incoming(data) {
    if (n_tx == 0) {
        console.log('transaction subscription result', JSON.parse(data.toString()));
    } else {
        const start = Date.now();
        let tx = JSON.parse(data.toString());
        let meta = tx.params.result.value;

        const info = await txid(meta);

        const end = Date.now() - start
        console.log('Detection to buy: ', end, ' ms');

        console.log(info);
    }
    n_tx++;
});

ws.on('close', function close() {
    console.log('Disconnected from the server.');
});

ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
});


const subscribe = {
    jsonrpc: '2.0',
    id: 123,
    method: 'chainstream.transactionsSubscribe',
    params: {
        network: 'solana-mainnet',
        verified: false,
        filter: {
            accountKeys: {
                all: ['WWWyP28Z3D4G2obxadzaQ66b41AaFYfhmuorMnX6B8q'],
            },
            commitment: 'processed',
        },
    },
}