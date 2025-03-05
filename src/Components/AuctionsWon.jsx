import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from '../Constant/constant';
import { useNavigate } from 'react-router-dom';

function AuctionsWon({ account }) {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  console.log("Account:", account);

  useEffect(() => {
    if (!account) {
      setError('Please connect your wallet to view auctions won.');
      setLoading(false);
      return;
    }

    const fetchAuctionsWon = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

        // Fetch all auctions from the contract
        const allAuctions = await contractInstance.getAuctions();
        console.log("All Auctions:", allAuctions);

        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

        // Fetch pending payments for the logged-in user
        const auctionsWon = await Promise.all(
          allAuctions.map(async (auction, index) => {
            const auctionEndTime = auction.startTime.toNumber() + auction.duration.toNumber();

            // Fetch pending payment for this auction and user
            const pendingPayment = await contractInstance.pendingPayments(index, account);
            console.log(`Pending Payment for Auction ${index}:`, pendingPayment.toString());

            return {
              id: index,
              name: auction.name,
              description: auction.description,
              startTime: auction.startTime.toNumber(),
              duration: auction.duration.toNumber(),
              highestBid: ethers.utils.formatEther(auction.highestBid.toString()),
              highestBidder: auction.highestBidder,
              ended: auction.ended,
              pendingPayment: ethers.utils.formatEther(pendingPayment.toString()),
            };
          })
        );

        console.log("Auctions Won with Pending Payments:", auctionsWon);

        // Filter auctions that the user has won and need to pay for
        const filteredAuctions = auctionsWon.filter((auction) => {
          const auctionEndTime = auction.startTime + auction.duration;

          return (
            // auction.statuspaid && // Auction not paid
            auction.highestBidder.toLowerCase() === account.toLowerCase() && // User is the highest bidder
            currentTime <= auctionEndTime + 24 * 3600 && // Payment deadline has not passed
            parseFloat(auction.highestBid) > 0 // Pending payment is greater than 0
          );
        });

        console.log("Filtered Auctions:", filteredAuctions);
        setAuctions(filteredAuctions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching auctions won:', err);
        setError('Failed to fetch auctions won. Check the console for details.');
        setLoading(false);
      }
    };

    fetchAuctionsWon();
  }, [account]);

  const handlePayment = async (auctionId, highestBid) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

      // Convert the highest bid to Wei
      const highestBidInWei = ethers.utils.parseEther(highestBid);

      // Call the payPendingBid function in the smart contract
      const tx = await contractInstance.payPendingBid(auctionId, {
        value: highestBidInWei,
        gasLimit: 300000,
      });
      await tx.wait();

      // Refresh the list of auctions won after payment
      const updatedAuctions = auctions.filter((auction) => auction.id !== auctionId);
      setAuctions(updatedAuctions);

      alert('Payment successful!');
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Failed to process payment. Check the console for details.');
    }
  };

  if (loading) {
    return <p>Loading auctions won...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Auctions Won</h2>
      {auctions.length === 0 ? (
        <p>No auctions won or all payments have been completed.</p>
      ) : (
        <ul>
          {auctions.map((auction) => (
            <li key={auction.id} style={{ marginBottom: '20px' }}>
              <h3>{auction.name}</h3>
              <p>{auction.description}</p>
              <p>
                <strong>Highest Bid:</strong> {auction.highestBid} ETH
              </p>
              <p>
                <strong>Start Time:</strong> {new Date((auction.startTime) * 1000).toLocaleString()}
              </p>
              <p>
                <strong>End Time:</strong> {new Date((auction.startTime + auction.duration) * 1000).toLocaleString()}
              </p>
              <p>
                <strong>Winner:</strong> {auction.highestBidder}
              </p>
              {auction.description.length > 0 && (
                <p>
                  <strong>Description:</strong> {auction.description}
                </p>
              )}
              <button
                onClick={() => {
                  window.open(`https://volta-explorer.energyweb.org/address/${contractAddress}/transactions#address-tabs`, '_blank');
                }}
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
                View Details
              </button>
              <button
                onClick={() => handlePayment(auction.id, auction.highestBid)}
                style={{
                  backgroundColor: '#28a745',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Pay Now
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AuctionsWon;
