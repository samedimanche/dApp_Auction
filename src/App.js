import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from './Constant/constant';
import Login from './Components/Login'; // Import the Login component
import LoginError from './Components/LoginError'; // Import the LoginError component
import CreateAuction from './Components/CreateAuction';
import AuctionList from './Components/AuctionList';
import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Container, Nav } from 'react-bootstrap';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  useEffect(() => {
    if (isConnected) {
      getAuctions();
    }
  }, [isConnected]);

  async function getAuctions() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
    const auctionsList = await contractInstance.getAuctions();
    setAuctions(auctionsList);
  }

  function handleAccountsChanged(accounts) {
    if (accounts.length > 0 && account !== accounts[0]) {
      setAccount(accounts[0]);
    } else {
      setIsConnected(false);
      setAccount(null);
    }
  }

  async function connectToMetamask() {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        console.log("Metamask Connected : " + address);
        setIsConnected(true);
      } catch (err) {
        console.error(err);
      }
    } else {
      console.error("Metamask is not detected in the browser");
    }
  }

  return (
    <Router>
      {isConnected && (
        <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
          <Container>
            <Navbar.Brand href="/">AuctionPlatform</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="mx-auto link_navbar1">
                <Link style={{ marginRight: "30px", color: '#5f5f5f', fontSize: '20px' }} to="/">Auctions</Link>
                {account === '0xf8abc2c83708d538285B2ceB53B7bE4F4D1B86fA' && (
                  <Link to="/createauction" style={{ color: '#5f5f5f', fontSize: '20px' }}>Create Auction</Link>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}
      <Routes>
        <Route
          path="/"
          element={
            isConnected ? (
              <AuctionList
                account={account}
                auctions={auctions}
              />
            ) : (
              <Login connectWallet={connectToMetamask} />
            )
          }
        />
        <Route
          path="/createauction"
          element={
            account === '0xf8abc2c83708d538285B2ceB53B7bE4F4D1B86fA' ? (
              <CreateAuction
                account={account}
              />
            ) : (
              <LoginError />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;