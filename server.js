import { wallet, SlippageBps, jitoTip, prioFee } from './panel.js';
import {
    VersionedTransaction,
    ComputeBudgetProgram,
    PublicKey,
} from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';


const quoteApi = 'https://api.jup.ag/swap/v1/quote';
const swapApi = 'https://api.jup.ag/swap/v1/swap';
const JITO_RPC =
    'https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/transactions';

// SOL MINT
const inputMint = 'So11111111111111111111111111111111111111112';

Bun.serve({
    port: 8000,
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



                const url = `${quoteApi}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount * 1e9}&slippageBps=${SlippageBps}&onlyDirectRoutes=true`;

                const quoteRes = await fetch(url);

                const quote = await quoteRes.json();

                const end1 = Date.now() - start;
                console.log('Overall time:' + end1 + 'ms');

                const start1 = Date.now();

                const swapRes = await fetch(swapApi, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userPublicKey: wallet.publicKey.toBase58(),
                        prioritizationFeeLamports: { jitoTipLamports: jitoTip },
                        dynamicComputeUnitLimit: true,
                        quoteResponse: quote,
                        wrapAndUnwrapSol: false,

                        destinationTokenAccount: ATA.toBase58(),
                    }),
                });

                console.log(swapRes)

                const { swapTransaction } = await swapRes.json();
                console.log('Swap transaction received, signing...');

                console.log(swapTransaction);
                const end2 = Date.now() - start1;

                console.log('Overall time:' + end2 + 'ms');


                let transaction = VersionedTransaction.deserialize(
                    Buffer.from(swapTransaction, 'base64')
                );

                let computeBudgetInstructionPrice =
                    ComputeBudgetProgram.setComputeUnitPrice({
                        microLamports: prioFee,
                    });

                const computeBudgetCompiledInstructionPrice = {
                    programIdIndex: transaction.message.staticAccountKeys.findIndex(
                        (key) =>
                            key.toBase58() ===
                            computeBudgetInstructionPrice.programId.toBase58()
                    ),
                    accountKeyIndexes: computeBudgetInstructionPrice.keys.map((key) =>
                        transaction.message.staticAccountKeys.findIndex(
                            (acc) => acc.toBase58() === key.pubkey.toBase58()
                        )
                    ),
                    data: new Uint8Array(computeBudgetInstructionPrice.data),
                };

                transaction.message.compiledInstructions.splice(
                    1,
                    0,
                    computeBudgetCompiledInstructionPrice
                );

                transaction.sign([wallet]);

                const transactionBinary = transaction.serialize();

                const transactionBase64 =
                    Buffer.from(transactionBinary).toString('base64');

                console.log('Transaction sent to jito...');

                // THIS IS THE LAST STEP!
                const sendResponse = await fetch(JITO_RPC, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: 1,
                        jsonrpc: '2.0',
                        method: 'sendTransaction',
                        params: [
                            transactionBase64,
                            {
                                encoding: 'base64',
                                skipPreflight: true,
                            },
                        ],
                    }),
                });


                // JITO RETURNS OUR SOLSCAN TX ID.

                const sendResult = await sendResponse.json();
                const end = Date.now() - start;

                console.log(`https://solscan.io/tx/${sendResult.result}`);
                console.log('Overall time:' + end + 'ms');

                return new Response(`https://solscan.io/tx/${sendResult.result}, ${end}`, {
                    status: 200,
                });
            } catch (error) {
                return new Response('Invalid JSON', { status: 400 });
            }
        }

        return new Response('Not Found', { status: 404 });
    },
});
