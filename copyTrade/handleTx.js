import dotenv from 'dotenv';
import { getPDA, getATA } from '../helper/helpers.js';
import { swap } from "./execute.js"
dotenv.config();


let userOwner = "WWWyP28Z3D4G2obxadzaQ66b41AaFYfhmuorMnX6B8q";
const SOL_MINT = "So11111111111111111111111111111111111111112";

let destination = "49atitTx1rNyvNRvvSe23e5FqvxCejWLxgbamRuXjkqH"
console.log(destination);
let amount = 0.00001

export async function txid(transaction) {

    if (!transaction.meta) {
        return "No meta data";
    }

    const owner = userOwner

    const preBalances = {};
    transaction.meta.preTokenBalances.forEach(token => {
        if (token.owner === owner) {
            const mint = token.mint;
            const amount = BigInt(token.uiTokenAmount.amount);
            preBalances[mint] = (preBalances[mint] || 0n) + amount;
        }
    });
    // console.log(preBalances);
    const postBalances = {};
    transaction.meta.postTokenBalances.forEach(token => {
        if (token.owner === owner) {
            const mint = token.mint;
            const amount = BigInt(token.uiTokenAmount.amount);
            postBalances[mint] = (postBalances[mint] || 0n) + amount;
        }
    });

    // console.log(postBalances);
    const allMints = new Set([...Object.keys(preBalances), ...Object.keys(postBalances)]);
    let inputMint = null, outputMint = null;
    let inputAmount = 0n, outputAmount = 0n;
    allMints.forEach(mint => {
        const pre = preBalances[mint] || 0n;
        const post = postBalances[mint] || 0n;
        const diff = post - pre;
        if (diff < 0n) {
            inputMint = mint;
            inputAmount = -diff;
        } else if (diff > 0n) {
            outputMint = mint;
            outputAmount = diff;
        }
    });
    const preSOL = BigInt(transaction.meta.preBalances[0]);
    const postSOL = BigInt(transaction.meta.postBalances[0]);
    const fee = BigInt(transaction.meta.fee);
    let solInput = 0n, solOutput = 0n;
    if (postSOL < preSOL) {
        const netSpent = preSOL - postSOL;
        if (netSpent > fee) {
            solInput = netSpent - fee;
        }
    } else if (postSOL > preSOL) {
        solOutput = (postSOL - preSOL) + fee;
    }
    if (!inputMint && solInput > 0n) {
        inputMint = SOL_MINT;
        inputAmount = solInput;
    }
    if (!outputMint && solOutput > 0n) {
        outputMint = SOL_MINT;
        outputAmount = solOutput;
    }
    const type = (inputMint && outputMint) ? 'swap' : (inputMint ? 'sell' : (outputMint ? 'buy' : null));

    console.log(type, inputMint, outputMint, inputAmount, outputAmount);

    if (inputMint === SOL_MINT) {
        console.log("Not SOL mint");
        destination = getATA(outputMint);
        console.log(destination.toBase58());
    }


    const executeSwap = await swap(inputMint, outputMint, amount * 1e9, destination);

    return executeSwap

    const objekt = {
        // type,
        inputMint,
        outputMint,
        // inputAmount: inputAmount.toString(),
        // outputAmount: outputAmount.toString()
    };

    return objekt
}

