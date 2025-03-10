import React, { useState } from 'react';

function AuctionHistory({ account, auctions, role }) {
  const [expandedAuctionId, setExpandedAuctionId] = useState(null);

  // Filter ended auctions (currentTime > startTime + duration)
  const currentTime = Math.floor(Date.now() / 1000);
  const endedAuctions = auctions.filter((auction) => {
    const startTime = auction.startTime;
    const duration = auction.duration;
    const endTime = startTime + duration;
    return currentTime > endTime;
  });

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
    <div className="p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Auction History</h2>
      {filteredAuctions.length === 0 ? (
        <p className="text-center text-gray-600">No ended auctions found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction, index) => {
            const startTime = auction.startTime;
            const duration = auction.duration;
            const endTime = startTime + duration;

            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{auction.name}</h3>
                  <p className="text-sm text-gray-700">
                    <strong>End Time:</strong> {new Date(endTime * 1000).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Status Paid:</strong> {auction.statuspaid == 0 ? 'No paid' : 'Paid'}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Rejected:</strong> {auction.rejected == 1 ? 'Rejected' : 'No rejected'}
                  </p>
                  <button
                    onClick={() => toggleDetails(index)}
                    className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                  >
                    {expandedAuctionId === index ? 'Hide Details' : 'Show Details'}
                  </button>
                  {expandedAuctionId === index && (
                    <div className="mt-4 space-y-2">
                      <div
                        className={`mb-6 ${
                          auction.description.length > 200
                            ? 'max-h-32 overflow-y-auto'
                            : ''
                        }`}
                      >
                        <p className="text-gray-700">
                          <strong>Description:</strong> {auction.description}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700">
                        <strong>Start Time:</strong> {new Date(startTime * 1000).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Duration:</strong> {duration / 60} minutes
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Initial Cost:</strong> {auction.initialCost} ETH
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Minimum Bid Step:</strong> {auction.minBidStep} ETH
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Time Step:</strong> {auction.timeStep} seconds
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Highest Bid:</strong> {auction.highestBid} ETH
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Highest Bidder:</strong> {auction.highestBidder}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AuctionHistory;