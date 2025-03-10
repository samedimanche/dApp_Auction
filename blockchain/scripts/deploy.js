async function main() {
  const Auction = await ethers.getContractFactory("Auction");

  // Start deployment, returning a promise that resolves to a contract object
  const auction = await Auction.deploy();
  console.log("Contract address:", auction.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });