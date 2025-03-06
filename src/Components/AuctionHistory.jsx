// AuctionHistory.jsx
import React, { useState } from 'react';

function AuctionHistory({ account, auctions, role }) {
  const [expandedAuctionId, setExpandedAuctionId] = useState(null);

  // Log the received auctions prop
  console.log("Received auctions prop in AuctionHistory:", auctions);

  // Filter ended auctions (currentTime > startTime + duration)
  const currentTime = Math.floor(Date.now() / 1000);
  const endedAuctions = auctions.filter((auction) => {
    const startTime = auction.startTime;
    const duration = auction.duration;
    const endTime = startTime + duration;
    return currentTime > endTime;
  });

  // Log the filtered ended auctions
  console.log("Ended auctions:", endedAuctions);

  // Filter auctions based on user role
  const filteredAuctions = role === 'admin' 
    ? endedAuctions 
    : endedAuctions.filter(auction => auction.highestBidder.toLowerCase() === account.toLowerCase());

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
      {filteredAuctions.length === 0 ? (
        <p>No ended auctions found.</p>
      ) : (
        filteredAuctions.map((auction, index) => {
          const startTime = auction.startTime;
          const duration = auction.duration;
          const endTime = startTime + duration;

          return (
            <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <h3>{auction.name}</h3>
              <p>End Time: {new Date(endTime * 1000).toLocaleString()}</p>
              <button onClick={() => toggleDetails(index)}>
                {expandedAuctionId === index ? 'Hide Details' : 'Show Details'}
              </button>
              {expandedAuctionId === index && (
                <div>
                  <p>{auction.description}</p>
                  <p>Start Time: {new Date(startTime * 1000).toLocaleString()}</p>
                  <p>Duration: {duration / 60} minutes</p>
                  <p>Initial Cost: {auction.initialCost} ETH</p>
                  <p>Minimum Bid Step: {auction.minBidStep} ETH</p>
                  <p>Time Step: {auction.timeStep} seconds</p>
                  <p>Highest Bid: {auction.highestBid} ETH</p>
                  <p>Highest Bidder: {auction.highestBidder}</p>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default AuctionHistory;