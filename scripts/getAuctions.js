// check smart contract Auctions history
// npx hardhat run scripts/getAuctions.js --network volta
const { ethers } = require("hardhat");

async function main() {
  // Replace with your deployed contract address
  const contractAddress = "0x2b7538ED455F2BF0193993204d7b062D4C001349";

  // Get the contract instance
  const Auction = await ethers.getContractFactory("Auction");
  const auctionContract = Auction.attach(contractAddress);

  // Call the getAuctions function
  const auctions = await auctionContract.getAuctions();

  // Log the results
  console.log("Number of auctions:", auctions.length);
  for (let i = 0; i < auctions.length; i++) {
    console.log(`Auction ${i}:`);
    console.log("Name:", auctions[i].name);
    console.log("Description:", auctions[i].description);
    console.log("Start Time:", auctions[i].startTime.toString());
    console.log("Duration:", auctions[i].duration.toString());
    console.log("Initial Cost:", ethers.utils.formatEther(auctions[i].initialCost), "ETH");
    console.log("Min Bid Step:", ethers.utils.formatEther(auctions[i].minBidStep), "ETH");
    console.log("Time Step:", auctions[i].timeStep.toString(), "seconds");
    console.log("Highest Bid:", ethers.utils.formatEther(auctions[i].highestBid), "ETH");
    console.log("Highest Bidder:", auctions[i].highestBidder);
    console.log("Ended:", auctions[i].ended);
    console.log("-----------------------------");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });