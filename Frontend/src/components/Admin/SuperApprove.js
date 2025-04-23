import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import the default toast styles

const SuperAdminPage = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // Fetch all admin requests where response is false
    axios.get('http://localhost:8080/api/admin/requests')
      .then(response => {
        setRequests(response.data);
      })
      .catch(error => {
        console.error(error);
        toast.error('Failed to fetch requests.'); // Toast notification for error fetching requests
      });
  }, []);

  const handleApprove = (id) => {
    axios.post(`http://localhost:8080/api/admin/approve/${id}`)
      .then(() => {
        setRequests(prev => prev.filter(request => request._id !== id));
        toast.success('Request approved successfully!'); // Success toast for approval
      })
      .catch(error => {
        console.error(error);
        toast.error('Failed to approve request.'); // Error toast for failure
      });
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:8080/api/admin/delete/${id}`)
      .then(() => {
        setRequests(prev => prev.filter(request => request._id !== id));
        toast.success('Request deleted successfully!'); // Success toast for deletion
      })
      .catch(error => {
        console.error(error);
        toast.error('Failed to delete request.'); // Error toast for failure
      });
  };

  return (
    <div>
      <h2>Admin Requests</h2>
      <ul>
        {requests.map(request => (
          <li key={request._id}>
            {request.userName} - {request.email}
            <button onClick={() => handleApprove(request._id)}>Approve</button>
            <button onClick={() => handleDelete(request._id)}>Delete</button>
          </li>
        ))}
      </ul>

      {/* ToastContainer for displaying notifications */}
      <ToastContainer />
    </div>
  );
};

export default SuperAdminPage;
