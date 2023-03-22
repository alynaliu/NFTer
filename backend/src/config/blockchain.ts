// @ts-nocheck
import axios from 'axios'

export async function getUserNFTs(wallet: string, contract: string, nextPageToken?: string)
{
    const url = nextPageToken !== undefined ?
        `https://${process.env.WEB3_PROVIDER}/getNFTs?owner=${wallet}&pageKey=${nextPageToken}&pageSize=20&contractAddresses[]=${contract}&withMetadata=true`
        :
        `https://${process.env.WEB3_PROVIDER}/getNFTs?owner=${wallet}&pageSize=20&contractAddresses[]=${contract}&withMetadata=true`;
    
    const results = (await axios.get(url)).data;
    let nfts = results.ownedNfts;
    if(results.pageKey !== undefined) {
        nfts = nfts.concat(await getUserNFTs(wallet, contract, results.pageKey));
    }

    return nfts;
}

export async function getNFTMetadata(contractAddress: string, tokenId: string)
{
    const url = `https://${process.env.WEB3_PROVIDER}/getNFTMetadata?contractAddress=${contractAddress}&tokenId=${tokenId}&refreshCache=false`;
    
    const results = (await axios.get(url)).data;
    return results;
}

export async function verifyNFTHolder(walletAddress: string, contractAddress: string, tokenId: string)
{
    const url = `https://${process.env.WEB3_PROVIDER}/getOwnersForToken?contractAddress=${contractAddress}&tokenId=${tokenId}`;
    
    const results = (await axios.get(url)).data;
    const holder = results.owners.filter(owner => owner.toLowerCase() === walletAddress.toLowerCase());
    return holder.length > 0;
}