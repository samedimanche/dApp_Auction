import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from '../Constant/constant';
import { useNavigate } from 'react-router-dom';

function AuctionList({ account, auctions }) {
  const [auctionList, setAuctionList] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Helper function to filter active auctions
  const filterActiveAuctions = (auctions) => {
    const currentTime = Math.floor(Date.now() / 1000);
    return auctions.filter(
      (auction) => currentTime <= auction.startTime + auction.duration
    );
  };

  useEffect(() => {
    const formattedAuctions = auctions.map((auction, index) => ({
      ...auction,
      id: index, // Ensure the correct auctionId is mapped
      initialCost: auction.initialCost, // Already formatted in App.js
      highestBid: auction.highestBid, // Already formatted in App.js
      minBidStep: auction.minBidStep, // Already formatted in App.js
      startTime: auction.startTime, // Already a number
      duration: auction.duration, // Already a number
      timeStep: auction.timeStep, // Already a number
    }));

    const activeAuctions = filterActiveAuctions(formattedAuctions);
    setAuctionList(activeAuctions);
  }, [auctions]);

  const handleParticipate = (auctionId) => {
    navigate(`/auction/${auctionId}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Active Auctions</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctionList.map((auction) => (
          <div
            key={auction.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{auction.name}</h3>
              <div
          className={`mb-6 ${
            auction.description.length > 200
              ? 'max-h-32 overflow-y-auto'
              : ''
          }`}
        >
          <p className="text-gray-700">{auction.description}</p>
        </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <strong>Start Time:</strong>{' '}
                  {new Date(auction.startTime * 1000).toLocaleString()}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>End Time:</strong>{' '}
                  {new Date((auction.startTime + auction.duration) * 1000).toLocaleString()}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Initial Cost:</strong> {auction.initialCost} ETH
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Highest Bid:</strong> {auction.highestBid} ETH
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Minimum Bid Step:</strong> {auction.minBidStep} ETH
                </p>
              </div>
              <button
                onClick={() => handleParticipate(auction.id)}
                className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
              >
                Participate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AuctionList;