import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';

dotenv.config();

const SlippageBps = 340; // 34% slippage
const jitoTip = 10000; // 0.0001 SOL
const prioFee = 10000; // 0.0001 SOL


const wallet = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY));
const wallet1 = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY_2));

/* const walletAddress = new PublicKey(
    'WWWyP28Z3D4G2obxadzaQ66b41AaFYfhmuorMnX6B8q'
);

const connection = new Connection(process.env.RPC_URL, 'processed');


async function getBalance(outputMint) {
    console.log(outputMint);

    const getDecimal = await fetch(
        `https://api.jup.ag/tokens/v1/token/${outputMint}`
    );
    const tokenInfo = await getDecimal.json();

    const mintAddress = new PublicKey(outputMint);

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        walletAddress,
        {
            mint: mintAddress,
        }
    );

    return tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
}
 */


export { wallet, wallet1, SlippageBps, jitoTip, prioFee };
