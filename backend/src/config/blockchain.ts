import AnkrProvider from '@ankr.com/ankr.js'
import { Blockchain } from '@ankr.com/ankr.js/dist/types'

const provider = new AnkrProvider();

//Supported blockchains
export function isOfTypeBlockchain(chain: string): chain is Blockchain {
    return ['arbitrum', 'avalanche', 'eth', 'polygon'].includes(chain);
}

export async function getUserNFTs(wallet: string, chain: string, contract: string, nextPageToken?: string) {
    const ankrFilters: {[key: string]: string[];}[] = [{}];
    ankrFilters[0][contract] = [];

    if(isOfTypeBlockchain(chain)) {
        const results = nextPageToken !== undefined ?
        await provider.getNFTsByOwner({
            blockchain: chain,
            walletAddress: wallet,
            filter: ankrFilters,
            pageToken: nextPageToken
        })
        :
        await provider.getNFTsByOwner({
            blockchain: chain,
            walletAddress: wallet,
            filter: ankrFilters,
        });

        let nfts = results.assets;

        if(results.nextPageToken !== '') {
            nfts = nfts.concat(await getUserNFTs(wallet, contract, results.nextPageToken));
        }

        return nfts;
    }
    else {
        throw new Error("Blockchain not supported by this app.");
    }
}