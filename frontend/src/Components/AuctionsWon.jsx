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
    const fetchAuctionsWon = async () => {
      try {
        if (!account) {
          setError('Please connect your wallet to view auctions won.');
          setLoading(false);
          return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

        const allAuctions = await contractInstance.getAuctions();
        console.log("All Auctions:", allAuctions);

        const auctionsWon = await Promise.all(
          allAuctions.map(async (auction, index) => {
            const auctionEndTime = auction.startTime.toNumber() + auction.duration.toNumber();
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
              statuspaid: auction.statuspaid.toNumber(),
              pendingPayment: ethers.utils.formatEther(pendingPayment.toString()),
              rejected: auction.rejected.toNumber(),
            };
          })
        );

        console.log("Auctions Won with Pending Payments:", auctionsWon);

        const currentTime = Math.floor(Date.now() / 1000);
        const filteredAuctions = auctionsWon.filter((auction) => {
          const auctionEndTime = auction.startTime + auction.duration;
          return (
            currentTime > auctionEndTime &&
            auction.statuspaid === 0 &&
            auction.highestBidder.toLowerCase() === account.toLowerCase() &&
            parseFloat(auction.highestBid) > 0
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

    if (!account) {
      const retryInterval = setInterval(() => {
        if (account) {
          clearInterval(retryInterval);
          fetchAuctionsWon();
        }
      }, 1000);
      return () => clearInterval(retryInterval);
    }

    fetchAuctionsWon();
  }, [account]);

  const handlePayment = async (auctionId, highestBid) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

      const highestBidInWei = ethers.utils.parseEther(highestBid);
      const tx = await contractInstance.payPendingBid(auctionId, {
        value: highestBidInWei,
        gasLimit: 300000,
      });
      await tx.wait();

      const updatedAuctions = auctions.filter((auction) => auction.id !== auctionId);
      setAuctions(updatedAuctions);

      alert('Payment successful!');
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Failed to process payment. Check the console for details.');
    }
  };

  const handleRejectPayment = async (auctionId, highestBid) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

      const rejectionFeeInWei = ethers.utils.parseEther((parseFloat(highestBid) * 0.1).toString());
      const tx = await contractInstance.payRejectedBidFine(auctionId, {
        value: rejectionFeeInWei,
        gasLimit: 300000,
      });
      await tx.wait();

      const updatedAuctions = auctions.filter((auction) => auction.id !== auctionId);
      setAuctions(updatedAuctions);

      alert('Rejection fee payment successful!');
    } catch (err) {
      console.error('Error processing rejection fee payment:', err);
      setError('Failed to process rejection fee payment. Check the console for details.');
    }
  };

  if (loading) {
    return <p className="text-center text-gray-600">Loading auctions won...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold text-center mb-8">Active Auctions</h2>
      {auctions.length === 0 ? (
        <p className="text-gray-600">No auctions won or all payments have been completed.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <div key={auction.id} className="bg-white shadow-md rounded-lg p-6">
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
              <p className="mb-2">
                <strong>Status Paid:</strong> {auction.statuspaid == 0 ? 'No paid' : 'Paid'}
              </p>
              <p className="mb-2">
                <strong>Highest Bid:</strong> {auction.highestBid} ETH
              </p>
              <p className="mb-2">
                <strong>Start Time:</strong> {new Date(auction.startTime * 1000).toLocaleString()}
              </p>
              <p className="mb-2">
                <strong>End Time:</strong> {new Date((auction.startTime + auction.duration) * 1000).toLocaleString()}
              </p>
              <p className="mb-4">
                <strong>Winner:</strong> {auction.highestBidder}
              </p>
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    window.open(`https://volta-explorer.energyweb.org/address/${contractAddress}/transactions#address-tabs`, '_blank');
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  View Details
                </button>
                <button
                  onClick={() => handlePayment(auction.id, auction.highestBid)}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Pay Now
                </button>
                {auction.rejected === 0 && (
                  <button
                    onClick={() => handleRejectPayment(auction.id, auction.highestBid)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AuctionsWon;