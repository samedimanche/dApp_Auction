import React, { useState } from 'react';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from '../Constant/constant';

function AuctionHistory({ account, auctions }) {
  const [expandedAuctionId, setExpandedAuctionId] = useState(null);

  // Filter ended auctions (currentTime > startTime + duration)
  const currentTime = Math.floor(Date.now() / 1000);
  const endedAuctions = auctions.filter((auction) => {
    const endTime = auction.startTime.toNumber() + auction.duration.toNumber();
    return currentTime > endTime;
  });

  // Toggle expanded auction details
  const toggleDetails = (auctionId) => {
    if (expandedAuctionId === auctionId) {
      setExpandedAuctionId(null); // Collapse if already expanded
    } else {
      setExpandedAuctionId(auctionId); // Expand the clicked auction
    }
  };

  return (
    <div>
      <h2>Auction History</h2>
      {endedAuctions.length === 0 ? (
        <p>No ended auctions found.</p>
      ) : (
        endedAuctions.map((auction, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            <h3>{auction.name}</h3>
            <p>End Time: {new Date((auction.startTime.toNumber() + auction.duration.toNumber()) * 1000).toLocaleString()}</p>
            <button onClick={() => toggleDetails(index)}>
              {expandedAuctionId === index ? 'Hide Details' : 'Show Details'}
            </button>
            {expandedAuctionId === index && (
              <div>
                <p>{auction.description}</p>
                <p>Start Time: {new Date(auction.startTime.toNumber() * 1000).toLocaleString()}</p>
                <p>Duration: {auction.duration.toNumber() / 60} minutes</p>
                <p>Initial Cost: {ethers.utils.formatEther(auction.initialCost)} ETH</p>
                <p>Minimum Bid Step: {ethers.utils.formatEther(auction.minBidStep)} ETH</p>
                <p>Time Step: {auction.timeStep.toNumber()} seconds</p>
                <p>Highest Bid: {ethers.utils.formatEther(auction.highestBid)} ETH</p>
                <p>Highest Bidder: {auction.highestBidder}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default AuctionHistory;