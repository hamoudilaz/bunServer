import { wallet, SlippageBps, jitoTip, prioFee } from '../panel.js';
import {
    VersionedTransaction,
    ComputeBudgetProgram,
    PublicKey,
} from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';

const quoteApi = 'https://api.jup.ag/ultra/v1/order';
const swapApi = 'https://api.jup.ag/swap/v1/swap';
const JITO_RPC =
    'https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/transactions';

// SOL MINT
const inputMint = 'So11111111111111111111111111111111111111112';

Bun.serve({
    port: 3000,
    async fetch(request) {
        const { pathname } = new URL(request.url);

        if (request.method === 'POST' && pathname === '/') {
            try {
                const { outputMint, amount } = await request.json();

                const start = Date.now();

                const ATA = getAssociatedTokenAddressSync(
                    new PublicKey(outputMint),
                    wallet.publicKey
                );

                const url = `${quoteApi}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount * 1e9}&taker=WWWyP28Z3D4G2obxadzaQ66b41AaFYfhmuorMnX6B8q`;

                const quoteRes = await fetch(url);
                const { requestId, transaction } = await quoteRes.json();

                let transactionReady = VersionedTransaction.deserialize(
                    Buffer.from(transaction, 'base64')
                );

                transactionReady.sign([wallet]);


                const signedTransaction = Buffer.from(transactionReady.serialize()).toString('base64');






                console.log('Transaction sent to jupiter...');

                // THIS IS THE LAST STEP!
                const sendResult = await (
                    await fetch(JITO_RPC, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', },
                        body: JSON.stringify({
                            id: 1,
                            jsonrpc: '2.0',
                            method: 'sendTransaction',
                            params: [
                                signedTransaction,
                                {
                                    encoding: 'base64',
                                    skipPreflight: true,
                                },
                            ],
                        }),
                    })
                ).json();

                // JITO RETURNS OUR SOLSCAN TX ID.


                const end = Date.now() - start;

                console.log(`https://solscan.io/tx/${sendResult.result}`);
                console.log('Overall time:' + end + 'ms');

                return new Response(
                    `https://solscan.io/tx/${sendResult.result}, ${end}`,
                    {
                        status: 200,
                    }
                );
            } catch (error) {
                return new Response('Invalid JSON', { status: 400 });
            }
        }

        return new Response('Not Found', { status: 404 });
    },
});
