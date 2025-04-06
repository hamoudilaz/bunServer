import WebSocket from 'ws';

import { TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';

import dotenv from 'dotenv';

dotenv.config();
const ws = new WebSocket(
    process.env.WSS_URL
);



ws.on('open', () => {
    console.log('Connected to Solana WebSocket');
    // Subscribe to account changes
    const subscriptionMessage = {
        jsonrpc: '2.0',
        id: 1,
        method: 'programSubscribe',
        params: [
            'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
            {
                encoding: 'jsonParsed',
                commitment: 'confirmed',
                filters: [
                    {
                        dataSize: 165
                    },
                    {
                        memcmp: {
                            offset: 32,
                            bytes: "WWWyP28Z3D4G2obxadzaQ66b41AaFYfhmuorMnX6B8q"
                        },
                    },
                ],
            },
        ],
    };
    ws.send(JSON.stringify(subscriptionMessage));
});

ws.on('message', (data) => {

    const response = JSON.parse(data);

    console.log(response)
    if (response.method === 'programNotification') {

        // const accountInfo = response.params.result.value.account.data.parsed.info.tokenAmount

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


[
    {
        mentions: [TOKEN_PROGRAM_ID]
    },
    {
        commitment: 'confirmed',
        filters: [
            {
                dataSize: 165,
            },
            {
                memcmp: {
                    offset: 32,
                    bytes: "WWWyP28Z3D4G2obxadzaQ66b41AaFYfhmuorMnX6B8q"
                },
            },
        ],
    }
]