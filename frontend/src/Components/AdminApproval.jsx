import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminApproval() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/admin/pending');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (userId, status) => {
    try {
      await axios.post('http://localhost:5000/api/auth/admin/approve', { userId, status });
      fetchPendingUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold text-center mb-8">Active Auctions</h2>
      {users.length === 0 ? (
        <p className="text-gray-600">No pending users.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(user => (
            <div key={user._id} className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">{user.username}</h3>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => handleApprove(user._id, 'approved')}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApprove(user._id, 'rejected')}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminApproval;
