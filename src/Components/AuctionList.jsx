import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from '../Constant/constant';

function AuctionList({ account, auctions }) {
  const [auctionList, setAuctionList] = useState([]);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState({});

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
      initialCost: ethers.utils.formatEther(auction.initialCost),
      highestBid: ethers.utils.formatEther(auction.highestBid),
      minBidStep: ethers.utils.formatEther(auction.minBidStep),
      startTime: auction.startTime.toNumber(),
      duration: auction.duration.toNumber(),
      timeStep: auction.timeStep.toNumber(),
    }));

    const activeAuctions = filterActiveAuctions(formattedAuctions);
    setAuctionList(activeAuctions);

    const initialCountdown = {};
    activeAuctions.forEach((auction) => {
      initialCountdown[auction.id] = auction.timeStep;
    });
    setCountdown(initialCountdown);
  }, [auctions]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prevCountdown) => {
        const newCountdown = { ...prevCountdown };
        Object.keys(newCountdown).forEach((auctionId) => {
          if (newCountdown[auctionId] > 0) {
            newCountdown[auctionId] -= 1;
          }
        });
        return newCountdown;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  async function placeBid(auctionId, bidAmount) {
    console.log("placeBid function called with:", { auctionId, bidAmount });
    try {
      if (!bidAmount || isNaN(bidAmount) || parseFloat(bidAmount) <= 0) {
        setError('Please enter a valid bid amount.');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

      const bidAmountInWei = ethers.utils.parseEther(bidAmount.toString());
      console.log("Bid Amount in Wei:", bidAmountInWei.toString());

      const auction = await contractInstance.auctions(auctionId);
      console.log("Auction Details:", auction);

      const currentTime = Math.floor(Date.now() / 1000);
      console.log("Current Time:", currentTime);
      if (currentTime < auction.startTime.toNumber()) {
        setError('Auction has not started yet.');
        return;
      }
      if (currentTime > auction.startTime.toNumber() + auction.duration.toNumber()) {
        setError('Auction has ended.');
        return;
      }

      const minBid = auction.highestBid.add(auction.minBidStep);
      console.log("Minimum Bid in Wei:", minBid.toString());
      console.log("Bid Amount in Wei:", bidAmountInWei.toString());
      if (bidAmountInWei.lt(minBid)) {
        setError(`Bid must be at least ${ethers.utils.formatEther(minBid)} ETH.`);
        return;
      }

      const tx = await contractInstance.placeBid(auctionId, {
        value: bidAmountInWei,
        gasLimit: 300000,
      });
      console.log("Transaction Sent:", tx);
      await tx.wait();

      setError('');
      const updatedAuctions = await contractInstance.getAuctions();
      const formattedAuctions = updatedAuctions.map((auction, index) => ({
        ...auction,
        id: index,
        initialCost: ethers.utils.formatEther(auction.initialCost),
        highestBid: ethers.utils.formatEther(auction.highestBid),
        minBidStep: ethers.utils.formatEther(auction.minBidStep),
        startTime: auction.startTime.toNumber(),
        duration: auction.duration.toNumber(),
        timeStep: auction.timeStep.toNumber(),
      }));

      // Filter out inactive auctions after updating
      const activeAuctions = filterActiveAuctions(formattedAuctions);
      setAuctionList(activeAuctions);

      // Update countdown for active auctions
      const updatedCountdown = {};
      activeAuctions.forEach((auction) => {
        updatedCountdown[auction.id] = auction.timeStep;
      });
      setCountdown(updatedCountdown);
    } catch (err) {
      console.error('Error placing bid:', err);
      setError('Failed to place bid. Check the console for details.');
    }
  }

  async function handleOutbid(auctionId) {
    const auction = auctionList.find(a => a.id === auctionId);
    const minBid = parseFloat(auction.highestBid) + parseFloat(auction.minBidStep);

    console.log("Highest Bid:", auction.highestBid);
    console.log("Minimum Bid Step:", auction.minBidStep);
    console.log("Calculated Minimum Bid:", minBid);

    const roundedBid = Math.ceil(minBid * 1e18) / 1e18;
    console.log("Rounded Bid:", roundedBid);

    await placeBid(auctionId, roundedBid.toString());
  }

  return (
    <div>
      <h2>Active Auctions</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {auctionList.map((auction) => (
        <div key={auction.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
          <h3>{auction.name}</h3>
          <p>{auction.description}</p>
          <p>Start Time: {new Date(auction.startTime * 1000).toLocaleString()}</p>
          <p>Duration: {auction.duration / 60} minutes</p>
          <p>Initial Cost: {auction.initialCost} ETH</p>
          <p>Minimum Bid Step: {auction.minBidStep} ETH</p>
          <p>Time Step: {auction.timeStep} seconds</p>
          <p>Highest Bid: {auction.highestBid} ETH</p>
          <p>Highest Bidder: {auction.highestBidder}</p>
          <p>Countdown: {countdown[auction.id]} seconds</p>
          <input
            type="number"
            step="0.01"
            placeholder="Bid Amount (ETH)"
            id={`bidAmount-${auction.id}`}
          />
          <button onClick={() => {
            console.log("Place Bid button clicked");
            placeBid(auction.id, document.getElementById(`bidAmount-${auction.id}`).value);
          }}>
            Place Bid
          </button>
          <button onClick={() => handleOutbid(auction.id)}>
            Outbid
          </button>
        </div>
      ))}
    </div>
  );
}

export default AuctionList;