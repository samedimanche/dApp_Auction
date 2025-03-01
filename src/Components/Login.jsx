import React from 'react';

function Login({ connectWallet }) {
  return (
    <div>
      <h2>Login</h2>
      <button onClick={connectWallet}>Connect to Metamask</button>
    </div>
  );
}

export default Login;