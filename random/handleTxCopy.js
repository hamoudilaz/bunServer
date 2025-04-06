import { Connection } from '@solana/web3.js';

import dotenv from 'dotenv';
dotenv.config();

const connection = new Connection(process.env.RPC_SHYFT, 'confirmed');

let userOwner = "WWWyP28Z3D4G2obxadzaQ66b41AaFYfhmuorMnX6B8q";
const SOL_MINT = "So11111111111111111111111111111111111111112";



export async function txid(transaction) {

    const owner = userOwner

    const preBalances = {};
    transaction.meta.preTokenBalances.forEach(token => {
        if (token.owner === owner) {
            const mint = token.mint;
            const amount = BigInt(token.uiTokenAmount.amount);
            preBalances[mint] = (preBalances[mint] || 0n) + amount;
        }
    });
    const postBalances = {};
    transaction.meta.postTokenBalances.forEach(token => {
        if (token.owner === owner) {
            const mint = token.mint;
            const amount = BigInt(token.uiTokenAmount.amount);
            postBalances[mint] = (postBalances[mint] || 0n) + amount;
        }
    });
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
    const objekt = {
        // type,
        inputMint,
        outputMint,
        // inputAmount: inputAmount.toString(),
        // outputAmount: outputAmount.toString()
    };

    return objekt
}

