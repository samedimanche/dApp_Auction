import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from '../Constant/constant';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

function AuctionDetail({ account }) {
  const { auctionId } = useParams();
  const [auction, setAuction] = useState(null);
  const [error, setError] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState(0); // Time left in seconds
  const [progress, setProgress] = useState(100); // Progress percentage (starts at 100%)
  const navigate = useNavigate();
  const [ws, setWs] = useState(null);

  const fetchAuctionDetails = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

      const auctionData = await contractInstance.auctions(auctionId);
      setAuction({
        id: auctionId,
        name: auctionData.name,
        description: auctionData.description,
        startTime: auctionData.startTime.toNumber(),
        duration: auctionData.duration.toNumber(),
        initialCost: ethers.utils.formatEther(auctionData.initialCost.toString()),
        minBidStep: ethers.utils.formatEther(auctionData.minBidStep.toString()),
        timeStep: auctionData.timeStep.toNumber(), // Total time step in seconds
        highestBid: ethers.utils.formatEther(auctionData.highestBid.toString()),
        highestBidder: auctionData.highestBidder,
        ended: auctionData.ended,
      });

      // Reset timeLeft to the full timeStep when fetching new auction details
      setTimeLeft(auctionData.timeStep.toNumber());
      setProgress(100); // Reset progress to 100% (fully filled)
    } catch (err) {
      console.error('Error fetching auction details:', err);
      setError('Failed to fetch auction details.');
    }
  };

  useEffect(() => {
    fetchAuctionDetails();
  }, [auctionId]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000');
    setWs(ws);
  
    ws.onopen = () => {
      if (auction) {
        ws.send(JSON.stringify({ auctionId, action: 'start', timeStep: auction.timeStep }));
      }
    };
  
    ws.onmessage = (event) => {
      const { auctionId: receivedAuctionId, timeLeft: receivedTimeLeft } = JSON.parse(event.data);
      if (receivedAuctionId === auctionId) {
        setTimeLeft(receivedTimeLeft);
        setProgress((receivedTimeLeft / auction?.timeStep) * 100);
      }
    };
  
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  
    return () => {
      ws.close();
    };
  }, [auctionId, auction?.timeStep]);
  
  const handlePlaceBid = async () => {
    try {
      if (!bidAmount || isNaN(bidAmount)) {
        setError('Please enter a valid bid amount.');
        return;
      }
  
      const bidAmountInWei = ethers.utils.parseEther(bidAmount.toString());
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
  
      // Check if the bid meets the minimum requirement
      const auctionData = await contractInstance.auctions(auctionId);
      const minBid = auctionData.highestBid.add(auctionData.minBidStep);
      if (bidAmountInWei.lt(minBid)) {
        setError(`Bid must be at least ${ethers.utils.formatEther(minBid)} ETH.`);
        return;
      }
  
      // Place the bid
      const tx = await contractInstance.placeBid(auctionId, bidAmountInWei, {
        gasLimit: 300000,
      });
      await tx.wait();
  
      // Clear errors, reset bid amount, and reset timeLeft to auction.timeStep
      setError('');
      setBidAmount('');
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ auctionId, action: 'reset', timeStep: auction.timeStep }));
      }
      await fetchAuctionDetails(); // Refresh the auction details
    } catch (err) {
      console.error('Error placing bid:', err);
      setError('Failed to place bid. Check the console for details.');
    }
  };

  const handleOutbid = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

      const auctionData = await contractInstance.auctions(auctionId);
      const minBid = auctionData.highestBid.add(auctionData.minBidStep);
      const minBidInEth = ethers.utils.formatEther(minBid);

      // Set the bid amount to the minimum required bid
      setBidAmount(minBidInEth);

      // Place the outbid
      const tx = await contractInstance.placeBid(auctionId, minBid, {
        gasLimit: 300000,
      });
      await tx.wait();

      // Clear errors, reset bid amount, and reset timeLeft to auction.timeStep
      setError('');
      setBidAmount('');
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ auctionId, action: 'reset', timeStep: auction.timeStep }));
      }
      await fetchAuctionDetails(); // Refresh the auction details
    } catch (err) {
      console.error('Error placing outbid:', err);
      setError('Failed to place outbid. Check the console for details.');
    }
  };

  const handlePayPendingBid = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

      const auctionData = await contractInstance.auctions(auctionId);
      const pendingPayment = await contractInstance.pendingPayments(auctionId, account);

      const tx = await contractInstance.payPendingBid(auctionId, {
        value: pendingPayment,
        gasLimit: 300000,
      });
      await tx.wait();

      // Clear errors and refresh auction details
      setError('');
      await fetchAuctionDetails(); // Refresh the auction details
    } catch (err) {
      console.error('Error paying pending bid:', err);
      setError('Failed to pay pending bid. Check the console for details.');
    }
  };

  if (!auction) {
    return <p className="text-center text-gray-600">Loading auction details...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-blue-500 hover:text-blue-600 mb-6"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back to Auctions</span>
        </button>

        <h2 className="text-3xl font-bold mb-4">{auction.name}</h2>

        {/* Scrollable Description */}
        <div
          className={`mb-6 ${
            auction.description.length > 200
              ? 'max-h-32 overflow-y-auto'
              : ''
          }`}
        >
          <p className="text-gray-700">{auction.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-sm text-gray-600">
              <strong>Start Time:</strong> {new Date(auction.startTime * 1000).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              <strong>End Time:</strong> {new Date((auction.startTime + auction.duration) * 1000).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Initial Cost:</strong> {auction.initialCost} ETH
            </p>
            <p className="text-sm text-gray-600">
              <strong>Minimum Bid Step:</strong> {auction.minBidStep} ETH
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              <strong>Highest Bid:</strong> {auction.highestBid} ETH
            </p>
            <p className="text-sm text-gray-600">
              <strong>Highest Bidder:</strong> {auction.highestBidder}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Time Step:</strong> {auction.timeStep} seconds
            </p>
          </div>
        </div>

        {/* Outbid Circle */}
        <div className="flex justify-center mb-8">
          <div
            className="relative w-32 h-32 flex items-center justify-center"
            onClick={handleOutbid}
          >
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                className="text-gray-200 stroke-current"
                strokeWidth="2"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-500 stroke-current"
                strokeWidth="2"
                strokeDasharray={`${progress}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <p className="text-sm text-gray-600">Outbid</p>
              <p className="text-sm text-gray-600">{timeLeft}s</p>
            </div>
          </div>
        </div>

        {/* Bid Input and Button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="number"
            step="0.01"
            placeholder="Bid Amount (ETH)"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handlePlaceBid}
            className="w-full sm:w-auto bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Place Bid
          </button>
        </div>

        {auction.ended && (
          <button
            onClick={handlePayPendingBid}
            className="w-full bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition duration-200"
          >
            Pay Pending Bid
          </button>
        )}

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
}

export default AuctionDetail;
