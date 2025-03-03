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
    <div>
      <h2>Admin Approval</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>
                <button onClick={() => handleApprove(user._id, 'approved')}>Approve</button>
                <button onClick={() => handleApprove(user._id, 'rejected')}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminApproval;