import { VersionedTransaction, ComputeBudgetProgram, } from '@solana/web3.js';
import { prioFee, jitoTip, SlippageBps, wallet1 as wallet, getBalance, userPublicKey } from '../copyMin/copypanel.js';
import dotenv from 'dotenv';

dotenv.config();


// API's
const quoteApi = process.env.JUP_QUOTE;
const swapApi = process.env.JUP_SWAP;
const JITO_RPC = process.env.JITO_RPC;

export async function swap(inputmint, outputMint, amount, destination) {
    try {

        console.log("InputMint: " + inputmint);
        console.log("OutputMint: " + outputMint);
        console.log("Amount: " + amount);
        console.log("Destination: " + destination);


        const url = `${quoteApi}?inputMint=${inputmint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${SlippageBps}&onlyDirectRoutes=true`;

        console.log('Requesting quote...');



        const quoteRes = await fetch(url);
        const quote = await quoteRes.json();



        if (quote.error) {
            console.error('Error getting quote:', quote.error);
            throw new Error(quote.error);
        }

        console.log('Quote received, requesting swap transaction...');


        const swapRes = await fetch(swapApi, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userPublicKey: userPublicKey,
                prioritizationFeeLamports: { jitoTipLamports: jitoTip },
                dynamicComputeUnitLimit: true,
                quoteResponse: quote,
                wrapAndUnwrapSol: false,
                destinationTokenAccount: destination,
            }),

        });

        const { swapTransaction } = await swapRes.json();


        console.log('Swap transaction received, signing...');

        if (!swapTransaction) {
            throw new Error("Error getting swap transaction");
        }


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
                    key.toBase58() === computeBudgetInstructionPrice.programId.toBase58()
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

        const transactionBase64 = Buffer.from(transaction.serialize()).toString(
            'base64'
        );


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


        if (sendResult.error) {
            console.error('Error sending transaction:', sendResult.error);
            throw new Error(sendResult.error.message);
        }

        const txid = `Transaction confirmed: https://solscan.io/tx/${sendResult.result}`
        return txid
    } catch (err) {
        return err;
    }
}
