
import { Metaplex } from "@metaplex-foundation/js";


const getMetaData = async (mintAddr) => {
    let mintAddress = new PublicKey(mintAddr);

    let tokenName = "";
    let tokenSymbol = "";
    let tokenLogo = "";

    const metadataAccount = metaplex
        .nfts()
        .pdas()
        .metadata({ mint: mintAddress });

    const metadataAccountInfo = await connection.getAccountInfo(metadataAccount);

    if (metadataAccountInfo) {
        const token = await metaplex.nfts().findByMint({ mintAddress: mintAddress });
        tokenName = token.name;
        tokenSymbol = token.symbol;
        //    @ts-ignore
        tokenLogo = token.json?.image;
    }

    return ({
        tokenName: tokenName,
        tokenSymbol: tokenSymbol,
        tokenLogo: tokenLogo,
    })
}