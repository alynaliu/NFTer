import { ethers } from 'hardhat'
import { NFTStorage, File } from 'nft.storage'
import fs from 'fs'
import mime from 'mime'

async function main() {
  const NFT_STORAGE_KEY = process.env.NFT_STORAGE_API_KEY as string;
  const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY });

  //DEPLOY CONTRACT
  const factory = await ethers.getContractFactory("TestNFT");
  const [owner] = await ethers.getSigners();
  const contract = await factory.deploy("NFT Rental Demo", "NRD");
  await contract.deployed();
  console.log("Contract deployed to: ", contract.address);
  console.log("Contract deployed by (Owner): ", owner.address, "\n");

  //On mint
  contract.on('Transfer', async (from, to, tokenId) => {
    console.log(`NFT ${tokenId} Minted`);

    const imageId = tokenId.toNumber() % 10;
    const content = await fs.promises.readFile(`./images/${imageId}.jpg`);
    const type = mime.getType(`./images/${imageId}.jpg`) as string;
    const image = new File([content], imageId.toString(), { type });

    const result = await nftstorage.store({
      "name": `TEST NFT ${tokenId}`,
      "description": "This is a really cool NFT",
      "image": image
    });
    const txn = await contract.setMetadata(tokenId, result.url);
    await txn.wait();
    console.log(`Set metadata for NFT ${tokenId}`);
  });

  const amountToMint = 1;
  for(let i=0; i<amountToMint; i++) {
    const txn = await contract.mintNFT(process.env.USER_PUBLIC_KEY);
    await txn.wait();
  }

  console.log("Finished minting. Sleeping for a minute");
  await new Promise(r => setTimeout(r, 60000));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
