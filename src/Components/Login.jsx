// import React from 'react';

// function Login({ connectWallet }) {
//   return (
//     <div>
//       <h2>Login</h2>
//       <button onClick={connectWallet}>Connect to Metamask</button>
//     </div>
//   );
// }

// export default Login;

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa'; // Import the logout icon

function Login({ setAuth, setRole }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      setAuth(true);
      setRole(res.data.role); // Set the user's role
      navigate('/');
    } catch (err) {
      console.error(err.response.data.msg);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the token
    setAuth(false); // Set authentication to false
    setRole(''); // Clear the role
    navigate('/'); // Redirect to the login page
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      {localStorage.getItem('token') && (
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '10px' }}>
          <FaSignOutAlt style={{ color: '#5f5f5f', fontSize: '20px' }} /> {/* Logout icon */}
        </button>
      )}
    </div>
  );
}

export default Login;