import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from '../Constant/constant';

function AuctionList({ account, auctions }) {
  const [auctionList, setAuctionList] = useState([]);

  useEffect(() => {
    setAuctionList(auctions);
  }, [auctions]);

  async function placeBid(auctionId, bidAmount) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

    const tx = await contractInstance.placeBid(auctionId, { value: ethers.utils.parseEther(bidAmount) });
    await tx.wait();
  }

  return (
    <div>
      <h2>Auctions</h2>
      {auctionList.map((auction, index) => (
        <div key={index}>
          <h3>{auction.name}</h3>
          <p>{auction.description}</p>
          <p>Start Time: {new Date(auction.startTime * 1000).toLocaleString()}</p>
          <p>Duration: {auction.duration / 60} minutes</p>
          <p>Initial Cost: {ethers.utils.formatEther(auction.initialCost)} ETH</p>
          <p>Minimum Bid Step: {ethers.utils.formatEther(auction.minBidStep)} ETH</p>
          <p>Time Step: {auction.timeStep / 60} minutes</p>
          <p>Highest Bid: {ethers.utils.formatEther(auction.highestBid)} ETH</p>
          <p>Highest Bidder: {auction.highestBidder}</p>
          <input type="number" placeholder="Bid Amount (ETH)" id={`bidAmount-${index}`} />
          <button onClick={() => placeBid(index, document.getElementById(`bidAmount-${index}`).value)}>Place Bid</button>
        </div>
      ))}
    </div>
  );
}

export default AuctionList;