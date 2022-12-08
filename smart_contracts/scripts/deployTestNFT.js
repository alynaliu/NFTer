async function main() {
  // Define a list of wallets to airdrop NFTs
  const airdropAddresses = [
        process.env.AHMEDS_PUBLIC_KEY, 
        process.env.JIYONGS_PUBLIC_KEY, 
        process.env.EDWARDS_PUBLIC_KEY
    ];

  const factory = await ethers.getContractFactory("TestNFT");
  const [owner] = await ethers.getSigners();
  const contract = await factory.deploy("NFT Rental Demo", "NRD");

  await contract.deployed();
  console.log("Contract deployed to: ", contract.address);
  console.log("Contract deployed by (Owner): ", owner.address, "\n");

  let txn;

  //Airdrop twice per wallet
  const amountToAirdrop = 2;
  for (let i = 0; i < amountToAirdrop; i++) {
    txn = await contract.airdropNfts(airdropAddresses);
    await txn.wait();
    console.log("NFTs airdropped successfully!");
  }

  console.log("\nCurrent NFT balances:");
  for (let i = 0; i < airdropAddresses.length; i++) {
    let bal = await contract.balanceOf(airdropAddresses[i]);
    console.log(`${i + 1}. ${airdropAddresses[i]}: ${bal}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
