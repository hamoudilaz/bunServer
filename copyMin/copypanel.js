import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';
import WebSocket from 'ws';
dotenv.config();

const connection = new Connection(process.env.RPC_URL, 'processed');

const ws = new WebSocket(process.env.WSS_SHYFT);

const SlippageBps = 3400; // 34% slippagez
const jitoTip = 1000000; // 0.000001 SOL
const prioFee = 100000000; // 0.000001 SOL

const wallet1 = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY_2));

const userPublicKey = wallet1.publicKey.toBase58();

console.log('Your PublicKey:' + userPublicKey);


async function getBalance(outputMint) {
    const getDecimal = await fetch(
        `https://api.jup.ag/tokens/v1/token/${outputMint}`
    );

    const { decimals } = await getDecimal.json();

    const mintAddress = new PublicKey(outputMint);

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        wallet1.publicKey,
        {
            mint: mintAddress,
        }
    );

    const amountToSell = Math.floor(
        tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount
    );


    return { amountToSell, decimals };
}



export { wallet1, SlippageBps, jitoTip, prioFee, connection, ws, getBalance, userPublicKey };
