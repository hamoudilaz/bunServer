import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';

dotenv.config();

const SlippageBps = 340;
const jitoTip = 10000;
const prioFee = 10000;

const WSS_URL =
    process.env.WSS_URL;

const connection = new Connection(process.env.RPC_URL, {
    wsEndpoint: WSS_URL,
    commitment: 'confirmed',
});

const smart_money_wallet = 'WWWyP28Z3D4G2obxadzaQ66b41AaFYfhmuorMnX6B8q';

const wallet = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY));

const wallet1 = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY_2));

export {
    wallet,
    wallet1,
    SlippageBps,
    jitoTip,
    prioFee,
    connection,
    smart_money_wallet,
};
