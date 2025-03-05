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
  const navigate = useNavigate();

  useEffect(() => {
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
          timeStep: auctionData.timeStep.toNumber(),
          highestBid: ethers.utils.formatEther(auctionData.highestBid.toString()),
          highestBidder: auctionData.highestBidder,
          ended: auctionData.ended,
        });
      } catch (err) {
        console.error('Error fetching auction details:', err);
        setError('Failed to fetch auction details.');
      }
    };

    fetchAuctionDetails();
  }, [auctionId]);

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

      // Confirm the bid without transferring funds
      const tx = await contractInstance.placeBid(auctionId, bidAmountInWei, {
        gasLimit: 300000,
      });
      await tx.wait();

      setError('');
      alert('Bid placed successfully!');
      navigate('/');
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

      // Confirm the outbid without transferring funds
      const tx = await contractInstance.placeBid(auctionId, minBid, {
        gasLimit: 300000,
      });
      await tx.wait();

      setError('');
      alert('Outbid placed successfully!');
      navigate('/');
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

      setError('');
      alert('Payment successful!');
      navigate('/');
    } catch (err) {
      console.error('Error paying pending bid:', err);
      setError('Failed to pay pending bid. Check the console for details.');
    }
  };

  if (!auction) {
    return <p>Loading auction details...</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <FaArrowLeft style={{ marginRight: '8px', fontSize: '20px' }} />
        <span style={{ fontSize: '18px' }}>Back to Auctions</span>
      </button>

      <h2>{auction.name}</h2>
      <p>{auction.description}</p>
      <p>
        <strong>Start Time:</strong> {new Date(auction.startTime * 1000).toLocaleString()}
      </p>
      <p>
        <strong>End Time:</strong> {new Date((auction.startTime + auction.duration) * 1000).toLocaleString()}
      </p>
      <p>
        <strong>Initial Cost:</strong> {auction.initialCost} ETH
      </p>
      <p>
        <strong>Minimum Bid Step:</strong> {auction.minBidStep} ETH
      </p>
      <p>
        <strong>Highest Bid:</strong> {auction.highestBid} ETH
      </p>
      <p>
        <strong>Highest Bidder:</strong> {auction.highestBidder}
      </p>
      <input
        type="number"
        step="0.01"
        placeholder="Bid Amount (ETH)"
        value={bidAmount}
        onChange={(e) => setBidAmount(e.target.value)}
        style={{ marginRight: '10px' }}
      />
      <button
        onClick={handlePlaceBid}
        style={{
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '10px',
        }}
      >
        Place Bid
      </button>
      <button
        onClick={handleOutbid}
        style={{
          backgroundColor: '#28a745',
          color: '#fff',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Outbid
      </button>
      {auction.ended && (
        <button
          onClick={handlePayPendingBid}
          style={{
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px',
          }}
        >
          Pay Pending Bid
        </button>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default AuctionDetail;