import React from 'react';

function LoginError() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
        <h2 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h2>
        <p className="text-gray-700">You do not have permission to access this page.</p>
      </div>
    </div>
  );
}

export default LoginError;
