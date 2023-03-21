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

  const amountToMint = 100;
  for(let i=0; i<amountToMint; i++) {
    const tokenId = await contract.getCurrentTokenID();
    const imageId = tokenId % 10;

    const content = await fs.promises.readFile(`./images/${imageId}.jpg`);
    const type = mime.getType(`./images/${imageId}.jpg`) as string;
    const image = new File([content], imageId.toString(), { type });
    const result = await nftstorage.store({
      "name": `TEST NFT ${tokenId}`,
      "description": "This is a really cool NFT",
      "image": image
    });
    
    const txn = await contract.mintNFT(process.env.USER_PUBLIC_KEY, result.url);
    await txn.wait();
    console.log(`NFT "${tokenId}" minted successfully!`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
