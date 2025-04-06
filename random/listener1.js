import dotenv from 'dotenv';
import { connection, ws } from './copypanel.js';
import { executeSwap } from './copy.js';
dotenv.config();

// the wallet you want to monitor, defined in .env
const smart_wallet = process.env.smart_wallet;

let SOL = 'So11111111111111111111111111111111111111112';


let side

let amount = 0.00001;

async function tx(tx) {
    const info = await connection.getTransaction(tx, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
    });

    if (!info) return console.log('Transaction not found');

    const meta = info.meta;
    const preTokenBalances = meta.preTokenBalances;
    const postTokenBalances = meta.postTokenBalances;

    let inputMint, outputMint;

    preTokenBalances.forEach(pre => {
        const post = postTokenBalances.find(p =>
            p.accountIndex === pre.accountIndex && p.mint === pre.mint
        );
        if (post) {
            const preAmount = pre.uiTokenAmount.uiAmount;
            const postAmount = post.uiTokenAmount.uiAmount;
            if (postAmount < preAmount) outputMint = pre.mint; // Token spent (input)
            if (postAmount > preAmount) inputMint = post.mint; // Token received (output)
        }
    });

    if (!inputMint || !outputMint) return console.log('mints not found');
    side = (inputMint === SOL) ? "buy" : "sell";



    const swap = await executeSwap(side, inputMint, outputMint, amount);

    return swap;

}



ws.on('open', () => {
    console.log('Connected to Solana WebSocket');
    const subscriptionMessage = {
        jsonrpc: '2.0',
        id: 1,
        method: 'logsSubscribe',
        params: [
            {
                mentions: [smart_wallet],
            },
            {
                commitment: 'processed',
            },
        ],
    };
    ws.send(JSON.stringify(subscriptionMessage));
});

ws.on('message', async (data) => {
    const response = JSON.parse(data);

    if (response.method === 'logsNotification') {
        console.log('Transaction detected');

        const signature = response.params.result.value.signature;
        if (!signature) return console.log('Signature not found');
        const start = Date.now();
        const copySwap = await tx(signature);
        console.log(copySwap)
        const end = Date.now() - start;
        console.log('From detection to buy ' + end + ' ms');
    } else if (response.result) {
        console.log(`Subscription ID: ${response.result}`);
    }
});

ws.on('error', (error) => {
    console.error(`WebSocket error: ${error.message}`);
});

ws.on('close', () => {
    console.log('WebSocket connection closed');
});
