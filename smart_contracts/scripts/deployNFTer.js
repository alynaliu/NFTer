async function main() {
  const factory = await ethers.getContractFactory("NFTer");
  const [owner] = await ethers.getSigners();
  const contract = await factory.deploy();

  await contract.deployed();
  console.log("Contract deployed to: ", contract.address);
  console.log("Contract deployed by (Owner): ", owner.address, "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
