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
    <div style={{ padding: '20px' }}>
      <h2>Active Auctions</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {auctionList.map((auction) => (
          <div
            key={auction.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
              width: '300px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3>{auction.name}</h3>
            <p>{auction.description}</p>
            <p>
              <strong>Start Time:</strong> {new Date(auction.startTime * 1000).toLocaleString()}
            </p>
            <p>
              <strong>End Time:</strong> {new Date((auction.startTime + auction.duration) * 1000).toLocaleString()}
            </p>
            <button
              onClick={() => handleParticipate(auction.id)}
              style={{
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Participate
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AuctionList;