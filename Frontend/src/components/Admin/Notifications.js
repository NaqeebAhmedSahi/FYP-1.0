import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/Admin/notifications.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminHeader from './AdminHeader';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentNotificationId, setCurrentNotificationId] = useState(null);
  const [response, setResponse] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/contacts');
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Failed to fetch notifications.');
        toast.error('Failed to fetch notifications. Please try again.');
      }
    };

    fetchNotifications();
  }, []);

  const deleteNotification = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/admin/contacts/${currentNotificationId}`);
      setNotifications(notifications.filter((notification) => notification._id !== currentNotificationId));
      toast.success('Notification deleted.');
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification.');
    }
  };

  const openResponseModal = (id) => {
    setCurrentNotificationId(id);
    setShowModal(true);
  };

  const handleResponse = async () => {
    if (response.trim()) {
      try {
        await axios.post(`http://localhost:8080/api/admin/respond/${currentNotificationId}`, { response });
        toast.success('Response sent.');
        setShowModal(false);
        setResponse('');
      } catch (error) {
        console.error('Error responding to notification:', error);
        toast.error('Failed to send response. Please try again.');
      }
    } else {
      toast.warning('Response cannot be empty.');
    }
  };

  const openConfirmModal = (id) => {
    setCurrentNotificationId(id);
    setShowConfirmModal(true);
  };

  return (
    <div className='notification'>
      <AdminHeader />

      <div className="container mt-4 mb-5">
        <h2 className="text-center mb-4">Notifications</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="table-responsive">
          <table className="table table-striped table-bordered text-center">
            <thead className="thead-dark">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.length === 0 ? (
                <tr>
                  <td colSpan="4">No notifications found.</td>
                </tr>
              ) : (
                notifications.map((notification) => (
                  <tr key={notification._id}>
                    <td>{notification.name}</td>
                    <td>{notification.email}</td>
                    <td>{notification.message}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openResponseModal(notification._id)}
                      >
                        Respond
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => openConfirmModal(notification._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Response Modal */}
      {showModal && (
        <div
          className="modal fade show"
          id="responseModal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="responseModalLabel"
          style={{ display: 'block', paddingRight: '17px' }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="responseModalLabel">Respond to Notification</h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setShowModal(false)}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <textarea
                  className="form-control"
                  rows="4"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Enter your response here"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleResponse}
                >
                  Send Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="modal fade show"
          id="confirmModal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="confirmModalLabel"
          style={{ display: 'block', paddingRight: '17px' }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="confirmModalLabel">Confirm Delete</h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setShowConfirmModal(false)}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={deleteNotification}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="footer text-center mt-auto">
        <p>&copy; 2024 GrapeJs: NLP Web Craft | All Rights Reserved</p>
      </footer>

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default Notifications;