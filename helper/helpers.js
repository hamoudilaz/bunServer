import { getAssociatedTokenAddress, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { userPublicKey } from '../copyMin/copypanel.js';
import { Connection, PublicKey, } from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

const connection = new Connection(process.env.RPC_SHYFT, {
    wsEndpoint: process.env.WSS_SHYFT,
    commitment: 'confirmed',
});

let solMint = 'So11111111111111111111111111111111111111112';


export const getPDA = async () => {
    const PDA = await getAssociatedTokenAddress(new PublicKey(solMint), new PublicKey(userPublicKey));
    return PDA.toBase58();
};

export function getATA(mint) {
    return getAssociatedTokenAddressSync(new PublicKey(mint), new PublicKey(userPublicKey));
}


