import { Connection } from '@solana/web3.js';
const connection = new Connection(
    'https://rpc.shyft.to?api_key=rSKG-cQnxTU3Uxa0',
    'confirmed'
);

const SOL = "So11111111111111111111111111111111111111112"

const sig = [
    "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"
]

async function tx(tx) {
    const start = Date.now();
    const info = await connection.getTransaction(tx, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
    });


    const meta = info.meta;
    const netChanges = {};
    meta.preTokenBalances.forEach((pre, i) => {
        const post = meta.postTokenBalances[i];


        const diff =
            Number(post.uiTokenAmount.amount) - Number(pre.uiTokenAmount.amount);


        const mint = pre.mint;

        netChanges[mint] = (netChanges[mint] || 0) + diff;

    });

    let solMint, tokenMint;
    Object.keys(netChanges).forEach((mint) => {
        if (mint === SOL) {

            solMint = mint;

        } else {

            tokenMint = mint;
        }
    });

    const end = Date.now()
    console.log(end - start)
    return

}


async function runMultipleTimes() {
    for (let i = 0; i < 60; i++) {
        await tx(sig[i])
        await delay(5)
    }
}


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

runMultipleTimes()



const meta = info.meta;
const preTokenBalances = meta.preTokenBalances;
const postTokenBalances = meta.postTokenBalances;

let inputMint, outputMint;

preTokenBalances.forEach(pre => {
    const post = postTokenBalances.find(p =>
        p.accountIndex === pre.accountIndex && p.mint === pre.mint
    );
    if (post) {
        const preAmount = pre.uiTokenAmount.uiAmount;
        const postAmount = post.uiTokenAmount.uiAmount;
        if (postAmount < preAmount) outputMint = pre.mint; // Token spent (input)
        if (postAmount > preAmount) inputMint = post.mint; // Token received (output)
    }
});

if (!inputMint || !outputMint) return console.log('mints not found');


console.log("Bought: " + inputMint);
console.log("Sold: " + outputMint);
