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
import './App.css';
import { FaSignOutAlt } from 'react-icons/fa';

import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Navbar, Container, Nav } from 'react-bootstrap';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [auctions, setAuctions] = useState([]);
  const [isAuthenticated, setAuth] = useState(false);
  const [role, setRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuth(true);
      getAuctions();
    }
  }, [isConnected]);

  async function getAuctions() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

      console.log("Fetching auctions from contract..."); // Debugging log
      const auctionsList = await contractInstance.getAuctions();
      console.log("Auctions fetched from contract:", auctionsList); // Debugging log

      // Format the auctions data
      const formattedAuctions = auctionsList.map((auction, index) => ({
        ...auction,
        id: index,
        initialCost: ethers.utils.formatEther(auction.initialCost.toString()), // Ensure it's a string
        highestBid: ethers.utils.formatEther(auction.highestBid.toString()), // Ensure it's a string
        minBidStep: ethers.utils.formatEther(auction.minBidStep.toString()), // Ensure it's a string
        startTime: auction.startTime.toNumber(),
        duration: auction.duration.toNumber(),
        timeStep: auction.timeStep.toNumber(),
      }));

      console.log("Formatted auctions:", formattedAuctions); // Debugging log

      setAuctions(formattedAuctions);
    } catch (err) {
      console.error("Error fetching auctions:", err); // Debugging log
    }
  }

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
        setRole={setRole}
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
  const navigate = useNavigate(); // Initialize the navigate function inside the Router context

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the token
    setAuth(false); // Set authentication to false
    setRole(''); // Clear the role
    navigate('/'); // Redirect to the login page
  };

  return (
    <>
      <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand href="/">AuctionPlatform</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="mx-auto link_navbar1">
              {isAuthenticated ? (
                <>
                  <Link style={{ marginRight: "30px", color: '#5f5f5f', fontSize: '20px' }} to="/">Auctions</Link>
                  <Link style={{ marginRight: "30px", color: '#5f5f5f', fontSize: '20px' }} to="/auction-history">Auction History</Link>
                  {role === 'admin' && (
                    <>
                      <Link to="/createauction" style={{ color: '#5f5f5f', fontSize: '20px' }}>Create Auction</Link>
                      <Link to="/admin-approval" style={{ color: '#5f5f5f', fontSize: '20px' }}>Admin Approval</Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link style={{ marginRight: "30px", color: '#5f5f5f', fontSize: '20px' }} to="/login">Login</Link>
                  <Link style={{ marginRight: "30px", color: '#5f5f5f', fontSize: '20px' }} to="/register">Register</Link>
                </>
              )}
            </Nav>
            {isAuthenticated && (
              <Nav>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <FaSignOutAlt style={{ color: '#5f5f5f', fontSize: '20px' }} /> {/* Logout icon */}
                </button>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
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
      </Routes>
    </>
  );
}

export default App;
