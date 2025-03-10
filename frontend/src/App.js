import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from './Constant/constant';
import Login from './Components/Login';
import Register from './Components/Register';
import AdminApproval from './Components/AdminApproval';
import LoginError from './Components/LoginError';
import CreateAuction from './Components/CreateAuction';
import AuctionList from './Components/AuctionList';
import AuctionHistory from './Components/AuctionHistory';
import AuctionDetail from './Components/AuctionDetail';
import AuctionsWon from './Components/AuctionsWon';
import './App.css';
import { FaSignOutAlt, FaBars } from 'react-icons/fa';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [auctions, setAuctions] = useState([]);
  const [isAuthenticated, setAuth] = useState(false);
  const [role, setRole] = useState('');

  // Check MetaMask connection and fetch auctions
  useEffect(() => {
    const checkMetaMaskAndFetchAuctions = async () => {
      if (window.ethereum) {
        try {
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]); // Set the connected account

          // Check the network (Volta chain ID: 0x12047)
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (chainId !== '0x12047') {
            console.error("Please connect to the Volta network!");
            return;
          }

          // Set up provider and signer
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

          console.log("Fetching auctions from contract...");
          const auctionsList = await contractInstance.getAuctions();
          console.log("Raw auctions data from contract:", auctionsList);

          // Format the auctions data
          const formattedAuctions = auctionsList.map((auction, index) => ({
            ...auction,
            id: index,
            initialCost: ethers.utils.formatEther(auction.initialCost.toString()),
            highestBid: ethers.utils.formatEther(auction.highestBid.toString()),
            minBidStep: ethers.utils.formatEther(auction.minBidStep.toString()),
            startTime: auction.startTime.toNumber(),
            duration: auction.duration.toNumber(),
            timeStep: auction.timeStep.toNumber(),
          }));

          console.log("Formatted auctions:", formattedAuctions);
          setAuctions(formattedAuctions);
        } catch (err) {
          console.error("Error fetching auctions:", err);
        }
      } else {
        console.error("MetaMask is not installed!");
      }
    };

    checkMetaMaskAndFetchAuctions();
  }, []);

  // Check authentication status and role on app initialization
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    if (token) {
      setAuth(true);
    }
    if (savedRole) {
      setRole(savedRole); // Set the role from localStorage
    }
  }, []);

  return (
    <Router>
      <AppContent
        provider={provider}
        setProvider={setProvider}
        account={account}
        setAccount={setAccount}
        isConnected={isConnected}
        setIsConnected={setIsConnected}
        auctions={auctions}
        setAuctions={setAuctions}
        isAuthenticated={isAuthenticated}
        setAuth={setAuth}
        role={role}
        setRole={(newRole) => {
          setRole(newRole);
          localStorage.setItem('role', newRole); // Persist role in localStorage
        }}
      />
    </Router>
  );
}

function AppContent({
  provider,
  setProvider,
  account,
  setAccount,
  isConnected,
  setIsConnected,
  auctions,
  setAuctions,
  isAuthenticated,
  setAuth,
  role,
  setRole,
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role'); // Clear role from localStorage on logout
    setAuth(false);
    setRole('');
    navigate('/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                AuctionPlatform
              </Link>
            </div>
            <div className="hidden sm:flex sm:space-x-8">
              {isAuthenticated ? (
                <>
                  <Link to="/" className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-lg font-medium">Auctions</Link>
                  <Link to="/auction-history" className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-lg font-medium">Auction History</Link>
                  <Link to="/auctions-won" className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-lg font-medium">Auctions Won</Link>
                  {role === 'admin' && (
                    <>
                      <Link to="/createauction" className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-lg font-medium">Create Auction</Link>
                      <Link to="/admin-approval" className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-lg font-medium">Admin Approval</Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-lg font-medium">Login</Link>
                  <Link to="/register" className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-lg font-medium">Register</Link>
                </>
              )}
            </div>
            <div className="sm:hidden flex items-center">
              <button onClick={toggleMenu} className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-lg font-medium">
                <FaBars />
              </button>
            </div>
            {isAuthenticated && (
              <div className="hidden sm:flex sm:items-center">
                <button onClick={handleLogout} className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-lg font-medium">
                  <FaSignOutAlt className="inline-block mr-1" /> Logout
                </button>
              </div>
            )}
          </div>
          {isOpen && (
            <div className="sm:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {isAuthenticated ? (
                  <>
                    <Link to="/" className="text-gray-900 hover:text-gray-700 block px-3 py-2 rounded-md text-lg font-medium">Auctions</Link>
                    <Link to="/auction-history" className="text-gray-900 hover:text-gray-700 block px-3 py-2 rounded-md text-lg font-medium">Auction History</Link>
                    <Link to="/auctions-won" className="text-gray-900 hover:text-gray-700 block px-3 py-2 rounded-md text-lg font-medium">Auctions Won</Link>
                    {role === 'admin' && (
                      <>
                        <Link to="/createauction" className="text-gray-900 hover:text-gray-700 block px-3 py-2 rounded-md text-lg font-medium">Create Auction</Link>
                        <Link to="/admin-approval" className="text-gray-900 hover:text-gray-700 block px-3 py-2 rounded-md text-lg font-medium">Admin Approval</Link>
                      </>
                    )}
                    <button onClick={handleLogout} className="text-gray-900 hover:text-gray-700 block px-3 py-2 rounded-md text-lg font-medium">
                      <FaSignOutAlt className="inline-block mr-1" /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-900 hover:text-gray-700 block px-3 py-2 rounded-md text-lg font-medium">Login</Link>
                    <Link to="/register" className="text-gray-900 hover:text-gray-700 block px-3 py-2 rounded-md text-lg font-medium">Register</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <AuctionList
                account={account}
                auctions={auctions}
              />
            ) : (
              <Login setAuth={setAuth} setRole={setRole} />
            )
          }
        />
        <Route
          path="/auction-history"
          element={
            isAuthenticated ? (
              <AuctionHistory
                account={account}
                auctions={auctions}
                role={role}
              />
            ) : (
              <Login setAuth={setAuth} setRole={setRole} />
            )
          }
        />
        <Route
          path="/auctions-won"
          element={
            isAuthenticated ? (
              <AuctionsWon
                account={account}
              />
            ) : (
              <Login setAuth={setAuth} setRole={setRole} />
            )
          }
        />
        <Route
          path="/createauction"
          element={
            role === 'admin' ? (
              <CreateAuction
                account={account}
              />
            ) : (
              <LoginError />
            )
          }
        />
        <Route
          path="/register"
          element={<Register />}
        />
        <Route
          path="/admin-approval"
          element={
            role === 'admin' ? (
              <AdminApproval />
            ) : (
              <LoginError />
            )
          }
        />
        <Route
          path="/login"
          element={<Login setAuth={setAuth} setRole={setRole} />}
        />
        <Route
          path="/auction/:auctionId"
          element={
            isAuthenticated ? (
              <AuctionDetail account={account} />
            ) : (
              <Login setAuth={setAuth} setRole={setRole} />
            )
          }
        />
        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </>
  );
}

function NotFound() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
        <h2 className="text-3xl font-bold text-red-500 mb-4">404 - Page Not Found</h2>
        <p className="text-gray-700">The page you are looking for does not exist.</p>
        <Link to="/" className="mt-4 text-blue-500 hover:underline">Go back to Home</Link>
      </div>
    </div>
  );
}

export default App;
